import { Injectable, NotFoundException } from "@nestjs/common";
import { VisionService } from "../vision/vision.service";
import { AggregatedVisualSearchResults } from "@vigilart/shared";
import {
  VisualSearchResult,
  MatchingPage,
  ArtworksReportEntryStatistics,
  ArtworksReportEntry,
  ArtworksReportStatistics,
  ArtworksReport
} from "@vigilart/shared";
import { ArtworksService } from "../artworks/artworks.service";
import { Artwork } from "@vigilart/shared";
import { DEFAULT_PAGINATION_LIMIT } from "@vigilart/shared";
import { GetArtworksMatchesDTO } from "@vigilart/shared";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly visionService: VisionService,
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService
  ) {}

  async aggregateVisualSearchResults(
    imageBuffer: Buffer
  ): Promise<AggregatedVisualSearchResults> {
    const visualSearchResults = await Promise.all([
      this.visionService.searchImage(imageBuffer)
    ]);
    const matchingPages = visualSearchResults.reduce<MatchingPage[]>(
      (acc: MatchingPage[], value: VisualSearchResult | null) => {
        if (value) {
          acc.push(...value.matchingPages);
        }
        return acc;
      },
      []
    );
    const statistics: ArtworksReportEntryStatistics = {
      totalMatches: matchingPages.length
    };

    return {
      statistics,
      matchingPages
    };
  }

  async getArtworksReportEntry(
    artwork: Artwork,
    limit?: number
  ): Promise<ArtworksReportEntry> {
    const imageBuffer = await this.storageService.getImage(artwork.storageKey);
    const aggregatedVisualSearchResults =
      await this.aggregateVisualSearchResults(imageBuffer);
    const matchingPages = aggregatedVisualSearchResults.matchingPages;
    const statistics = aggregatedVisualSearchResults.statistics;

    return {
      artworkId: artwork.id,
      statistics,
      matchingPages: matchingPages.slice(0, limit ?? matchingPages.length)
    };
  }

  async getArtworksReportEntries(
    userId: string,
    limit?: number
  ): Promise<ArtworksReportEntry[]> {
    const artworks = await this.artworksService.findAllPerUser(userId);
    const entries: ArtworksReportEntry[] = await Promise.all(
      artworks.map(async (artwork: Artwork) => {
        return this.getArtworksReportEntry(artwork, limit);
      })
    );
    return entries;
  }

  getArtworksReportStatistics(
    entries: ArtworksReportEntry[]
  ): ArtworksReportStatistics {
    const totalMatches = entries.reduce(
      (acc: number, entry: ArtworksReportEntry) =>
        acc + entry.statistics.totalMatches,
      0
    );

    return {
      totalMatches
    };
  }

  async getArtworksReport(userId: string): Promise<ArtworksReport> {
    const entries: ArtworksReportEntry[] = await this.getArtworksReportEntries(
      userId,
      DEFAULT_PAGINATION_LIMIT
    );
    const statistics: ArtworksReportStatistics =
      this.getArtworksReportStatistics(entries);

    return {
      detectionDate: new Date(),
      statistics,
      entries
    };
  }

  async getAllArtworksMatches(
    userId: string,
    { websiteCategory }: GetArtworksMatchesDTO
  ): Promise<MatchingPage[]> {
    const entries: ArtworksReportEntry[] =
      await this.getArtworksReportEntries(userId);
    const matchingPages = entries.reduce(
      (acc: MatchingPage[], value: ArtworksReportEntry) => {
        acc.push(...value.matchingPages);
        return acc;
      },
      []
    );
    if (websiteCategory) {
      const filteredMatchingPages = matchingPages.filter(
        (page: MatchingPage) => page.category == websiteCategory
      );
      return filteredMatchingPages;
    }
    return matchingPages;
  }

  async getArtworkMatches(
    artworkId: string,
    { websiteCategory }: GetArtworksMatchesDTO
  ): Promise<MatchingPage[]> {
    const artwork = await this.artworksService.findOne(artworkId);

    if (!artwork) {
      throw new NotFoundException("Artwork not found");
    }
    const imageBuffer = await this.storageService.getImage(artwork.storageKey);
    const aggregatedVisualSearchResults =
      await this.aggregateVisualSearchResults(imageBuffer);
    const matchingPages = aggregatedVisualSearchResults.matchingPages;
    if (websiteCategory) {
      const filteredMatchingPages = matchingPages.filter(
        (page: MatchingPage) => page.category == websiteCategory
      );
      return filteredMatchingPages;
    }
    return matchingPages;
  }
}
