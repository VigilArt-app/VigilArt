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
      // this.googleLensService.searchImage(imageDownloadUrl)
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
    try {
      const matchingPagesIds = await this.findArtworksMatches(userId);

      return await this.prisma.artworksReport.create({
        data: {
          userId,
          matchingPages: {
            connect: matchingPagesIds.map((id) => ({ id }))
          }
        }
      });
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new NotFoundException("User does not exist");
      }
      throw e;
    }
  }

  async findMatchesByArtwork(
    artworkId: string,
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding matches of artwork ${artworkId}`);
    let selectedReportId = "";

    const artwork = await this.artworksService.findOne(artworkId);
    if (artwork.userId !== userId) {
      throw new ForbiddenException("Access denied to this artwork");
    }
    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      const report = await this.findOne(reportId);
      if (report.userId !== userId) {
        throw new ForbiddenException("Access denied to this report");
      }
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

  async findOne(id: string): Promise<ArtworksReportGet> {
    try {
      this.logger.log(`Finding report ${id}`);
      return await this.prisma.artworksReport.findUniqueOrThrow({
        where: {
          id
        },
        include: { matchingPages: true }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork report not found");
      }
      throw e;
    }
  }

  async findLatestReport(userId: string): Promise<ArtworksReport> {
    try {
      this.logger.log(`Finding latest report for user ${userId}`);
      return await this.prisma.artworksReport.findFirstOrThrow({
        where: {
          userId
        },
        orderBy: {
          detectionDate: "desc"
        }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Latest report not found");
      }
      throw e;
    }
  }

  async findMatchesByUser(
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding matches for user ${userId}`);
    let selectedReportId = "";

    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      const report = await this.findOne(reportId);
      if (report.userId !== userId) {
        throw new ForbiddenException("Access denied to this report");
      }
      selectedReportId = reportId;
    } else {
      this.logger.log("Retrieving latest report");
      const latestReport = await this.findLatestReport(userId);
      selectedReportId = latestReport.id;
    }
    const { matchingPages } = await this.findOne(selectedReportId);
    return matchingPages;
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
    try {
      await this.prisma.artworksReport.delete({
        where: {
          id
        }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artworks report not found");
      }
      throw e;
    }
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
