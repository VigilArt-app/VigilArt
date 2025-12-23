import { Injectable, NotFoundException } from "@nestjs/common";
import { VisionService } from "../vision/vision.service";
import { AggregatedVisualSearchResults } from "./types";
import {
  VisualSearchResult,
  MatchingPage,
  ArtworksReportEntryStatistics,
  ArtworksReportEntry,
  ArtworksReportStatistics,
  ArtworksReport,
} from "./interfaces";
import { ArtworksService } from "../artworks/artworks.service";
import { Artwork } from "@vigilart/shared";
import { DEFAULT_PAGINATION_LIMIT } from "./constants";
import { GetArtworksMatchesDto } from "./dto/get-matches";

@Injectable()
export class ReportsService {
  constructor(
    private readonly visionService: VisionService,
    private readonly artworksService: ArtworksService
  ) {}

  async aggregateVisualSearchResults(
    imageUri: string
  ): Promise<AggregatedVisualSearchResults> {
    try {
      const visualSearchResults = await Promise.all([
        this.visionService.searchImage(imageUri),
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
        totalMatches: matchingPages.length,
      };

      return {
        statistics,
        matchingPages,
      };
    } catch (e) {
      throw e;
    }
  }

  async getArtworksReportEntry(
    artwork: Artwork,
    limit?: number
  ): Promise<ArtworksReportEntry> {
    try {
      const aggregatedVisualSearchResults =
        await this.aggregateVisualSearchResults(artwork.imageUri);
      const matchingPages = aggregatedVisualSearchResults.matchingPages;
      const statistics = aggregatedVisualSearchResults.statistics;

      return {
        artworkId: artwork.id,
        statistics,
        matchingPages: matchingPages.slice(0, limit ?? matchingPages.length),
      };
    } catch (e) {
      throw e;
    }
  }

  async getArtworksReportEntries(
    userId: string,
    limit?: number
  ): Promise<ArtworksReportEntry[]> {
    try {
      const artworks = await this.artworksService.findAllPerUser(userId);
      const entries: ArtworksReportEntry[] = await Promise.all(
        artworks.map(async (artwork: Artwork) => {
          return this.getArtworksReportEntry(artwork, limit);
        })
      );
      return entries;
    } catch (e: any) {
      throw e;
    }
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
      totalMatches,
    };
  }

  async getArtworksReport(userId: string): Promise<ArtworksReport> {
    try {
      const entries: ArtworksReportEntry[] =
        await this.getArtworksReportEntries(userId, DEFAULT_PAGINATION_LIMIT);
      const statistics: ArtworksReportStatistics =
        this.getArtworksReportStatistics(entries);

      return {
        detectionDate: new Date().toISOString(),
        statistics,
        entries,
      };
    } catch (e: any) {
      throw e;
    }
  }

  async getAllArtworksMatches(
    userId: string,
    { websiteCategory }: GetArtworksMatchesDto
  ): Promise<MatchingPage[]> {
    try {
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
    } catch (e) {
      throw e;
    }
  }

  async getArtworkMatches(
    artworkId: string,
    { websiteCategory }: GetArtworksMatchesDto
  ): Promise<MatchingPage[]> {
    try {
      const artwork = await this.artworksService.findOne(artworkId);

      if (!artwork) {
        throw new NotFoundException(`Artwork ${artworkId} not found`);
      }
      const aggregatedVisualSearchResults =
        await this.aggregateVisualSearchResults(artwork.imageUri);
      const matchingPages = aggregatedVisualSearchResults.matchingPages;
      if (websiteCategory) {
        const filteredMatchingPages = matchingPages.filter(
          (page: MatchingPage) => page.category == websiteCategory
        );
        return filteredMatchingPages;
      }
      return matchingPages;
    } catch (e) {
      throw e;
    }
  }
}
