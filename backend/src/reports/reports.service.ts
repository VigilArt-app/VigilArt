import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
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

@Injectable()
export class ReportsService {
  constructor(
    private readonly visionService: VisionService,
    private readonly googleLensService: GoogleLensService,
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService,
    private readonly matchingPagesService: MatchingPagesService,
    private readonly prisma: PrismaService
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

  async generate(userId: string): Promise<ArtworksReport> {
    this.logger.log(`Generate new report for user ${userId}`);
    const matchingPagesIds = await this.findArtworksMatches(userId);

    return this.prisma.artworksReport.create({
      data: {
        userId,
        matchingPages: {
          connect: matchingPagesIds.map((id) => ({ id }))
        }
      }
    });
  }

  async findMatchesByArtwork(
    artworkId: string,
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding matches of artwork ${artworkId}`);
    let selectedReportId = "";

    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      await this.findOne(userId, reportId);
      selectedReportId = reportId;
    } else {
      this.logger.log("Retrieving latest report");
      const latestReport = await this.findLatestReport(userId);
      selectedReportId = latestReport.id;
    }
    return this.prisma.matchingPage.findMany({
      where: {
        artworkId,
        reports: {
          some: {
            id: selectedReportId
          }
        }
      }
    });
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

    return assertResourceOwnership(
      report,
      userId
    );
  }

  async findLatestReport(userId: string): Promise<ArtworksReport> {
    this.logger.log(`Finding latest report for user ${userId}`);
    return this.prisma.artworksReport.findFirstOrThrow({
      where: {
        userId
      },
      orderBy: {
        detectionDate: "desc"
      }
    });
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
      const latestReport = await this.findLatestReport(userId);
      selectedReport = await this.findOne(userId, latestReport.id);
    }
    return selectedReport.matchingPages;
  }

  async getGlobalStatistics(
    userId: string,
    reportId?: string
  ): Promise<ArtworksReportStatistics> {
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
