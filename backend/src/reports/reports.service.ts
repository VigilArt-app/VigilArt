import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { VisionService } from "../vision/vision.service";
import {
  VisualSearchResult,
  ArtworksReport,
  Artwork,
  ArtworksReportGet,
  ArtworksReportStatistics,
  MatchingPage,
  MatchingPageGet,
  ApiBatchPayload,
  MATCHING_PAGE_CREATE_BATCH_MAX_SIZE,
  MatchingPageCreateMany
} from "@vigilart/shared";
import { ArtworksService } from "../artworks/artworks.service";
import { StorageService } from "../storage/storage.service";
import { PrismaService } from "../prisma/prisma.service";
import { MatchingPagesService } from "./matchingPage.service";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { assertResourceOwnership } from "../common/utils/ownership";

const REPORTS_STATS_TTL = 30 * 24 * 60 * 60 * 1000;

const REPORT_STATS_KEY = (userId: string) => {
  return `reports:statistics:${userId}`;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly visionService: VisionService,
    private readonly googleLensService: GoogleLensService,
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService,
    private readonly matchingPagesService: MatchingPagesService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private readonly logger = new Logger(ReportsService.name);

  async aggregateVisualSearchResults(
    imageBuffer: Buffer,
    imageDownloadUrl: string
  ): Promise<MatchingPageGet[]> {
    const visualSearchResults = await Promise.all([
      this.visionService.searchImage(imageBuffer),
      this.googleLensService.searchImage(imageDownloadUrl)
    ]);
    const matchingPages = visualSearchResults.reduce<MatchingPageGet[]>(
      (acc: MatchingPageGet[], value: VisualSearchResult | null) => {
        if (value) {
          acc.push(...value.matchingPages);
        }
        return acc;
      },
      []
    );
    return matchingPages;
  }

  async findArtworkMatches(artwork: Artwork): Promise<MatchingPageCreateMany> {
    const imageBuffer = await this.storageService.getImage(artwork.storageKey);
    const imageDownloadUrl = await this.storageService.getDownloadUrl(
      artwork.storageKey
    );
    const matchingPages = await this.aggregateVisualSearchResults(
      imageBuffer,
      imageDownloadUrl
    );
    const matchingPagesData = matchingPages.map((match) => ({
      artworkId: artwork.id,
      ...match
    }));

    return matchingPagesData;
  }

  async findArtworksMatches(userId: string): Promise<string[]> {
    const artworks = await this.artworksService.findAllPerUser(userId);

    const allMatches = await Promise.all(
      artworks.map((artwork) => this.findArtworkMatches(artwork))
    );
    const matchingPagesData = allMatches.flat();

    const foundMatchesIds: string[] = [];
    for (
      let i = 0;
      i < matchingPagesData.length;
      i += MATCHING_PAGE_CREATE_BATCH_MAX_SIZE
    ) {
      const res = await this.matchingPagesService.createMany(
        matchingPagesData.slice(i, i + MATCHING_PAGE_CREATE_BATCH_MAX_SIZE)
      );
      foundMatchesIds.push(...res.matchingPages.map((m) => m.id));
    }
    return foundMatchesIds;
  }

  async checkLastScan(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentArtwork = await this.prisma.artwork.findFirst({
      where: {
        userId,
        lastScanAt: {
          gt: thirtyDaysAgo
        }
      }
    });

    if (recentArtwork)
      throw new ForbiddenException("One or more artworks were scanned less than 30 days ago. Please wait before generating a new report.");
  }

  async generate(userId: string): Promise<ArtworksReport> {
    await this.checkLastScan(userId);
    this.logger.log(`Generate new report for user ${userId}`);

    const matchingPagesIds = await this.findArtworksMatches(userId);
    const report = await this.prisma.artworksReport.create({
      data: {
        userId,
        matchingPages: {
          connect: matchingPagesIds.map((id) => ({ id }))
        }
      }
    });

    await this.prisma.artwork.updateMany({
      where: { userId },
      data: { lastScanAt: new Date() }
    });
    await this.cacheManager.del(REPORT_STATS_KEY(userId));
    return report;
  }

  async findMatchesByArtwork(
    artworkId: string,
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding matches of artwork ${artworkId}`);

    // Enforces ownership: throws ForbiddenException if the artwork isn't the user's.
    await this.artworksService.findOne(userId, artworkId);

    let report: ArtworksReportGet;
    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      report = await this.findOne(userId, reportId);
    } else {
      this.logger.log("Retrieving latest report");
      report = await this.findLatestReport(userId);
    }
    return report.matchingPages.filter((p) => p.artworkId === artworkId);
  }

  async findAll(): Promise<ArtworksReport[]> {
    this.logger.log("Finding all reports");
    return this.prisma.artworksReport.findMany();
  }

  async findAllPerUser(userId: string): Promise<ArtworksReport[]> {
    this.logger.log(`Finding all reports for user ${userId}`);
    return this.prisma.artworksReport.findMany({
      where: {
        userId
      }
    });
  }

  async findOne(userId: string, id: string): Promise<ArtworksReportGet> {
    this.logger.log(`Finding report ${id}`);
    const report = await this.prisma.artworksReport.findUniqueOrThrow({
      where: {
        id
      },
      include: { matchingPages: true }
    });

    return assertResourceOwnership(report, userId);
  }

  async findLatestReport(userId: string): Promise<ArtworksReportGet> {
    this.logger.log(`Finding latest report for user ${userId}`);
    const report = await this.prisma.artworksReport.findFirstOrThrow({
      where: {
        userId
      },
      orderBy: {
        detectionDate: "desc"
      },
      include: { matchingPages: true }
    });
    return assertResourceOwnership(report, userId);
  }

  async findMatchesByUser(
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    let selectedReport: ArtworksReportGet;

    this.logger.log(`Finding matches for user ${userId}`);
    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      selectedReport = await this.findOne(userId, reportId);
    } else {
      this.logger.log("Retrieving latest report");
      selectedReport = await this.findLatestReport(userId);
    }
    return selectedReport.matchingPages;
  }

  async getGlobalStatistics(
    userId: string,
    reportId?: string
  ): Promise<ArtworksReportStatistics> {
    if (!reportId) {
      const cached = await this.cacheManager.get<ArtworksReportStatistics>(REPORT_STATS_KEY(userId));
      if (cached)
        return cached;

      const matchingPages = await this.findMatchesByUser(userId);
      const result: ArtworksReportStatistics = { totalMatches: matchingPages.length };

      await this.cacheManager.set(REPORT_STATS_KEY(userId), result, REPORTS_STATS_TTL);
      return result;
    }

    const matchingPages = await this.findMatchesByUser(userId, reportId);

    return {
      totalMatches: matchingPages.length
    };
  }

  async getArtworkStatistics(
    artworkId: string,
    userId: string,
    reportId?: string
  ): Promise<ArtworksReportStatistics> {
    const matchingPages = await this.findMatchesByArtwork(
      artworkId,
      userId,
      reportId
    );

    return {
      totalMatches: matchingPages.length
    };
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing artworks report ${id}`);
    await this.prisma.artworksReport.delete({
      where: {
        id
      }
    });
  }

  async removeMany(ids: string[]): Promise<ApiBatchPayload> {
    this.logger.log(`Removing artworks reports ${ids.join(",")}`);
    return await this.prisma.artworksReport.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }
}
