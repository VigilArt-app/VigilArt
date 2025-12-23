import { WebsiteCategoryType } from "@vigilart/shared/enums";

export interface VisualSearchResult {
  metadata: ArtworkMetadata | null;
  matchingPages: MatchingPage[];
}

export interface ArtworksReportEntryStatistics {
  totalMatches: number;
  // totalUncreditedMatches: number;
}

export interface ArtworksReportStatistics {
  totalMatches: number;
  // totalUncreditedMatches: number;
}

export interface ArtworkMetadataLabel {
  label: string;
  languageCode?: string;
}

export interface ArtworkWebEntity {
  score: number;
  description: string;
}

export interface ArtworkMetadata {
  bestGuessLabels: ArtworkMetadataLabel[];
  webEntities: ArtworkWebEntity[];
}

export interface MatchingPage {
  url: string;
  pageTitle?: string;
  category: WebsiteCategoryType | null;
  websiteName: string | null;
  imageUrl?: string;
}

export interface ArtworksReportEntry {
  artworkId: string;
  statistics: ArtworksReportEntryStatistics;
  matchingPages: MatchingPage[];
}

export interface ArtworksReport {
  detectionDate: string;
  statistics: ArtworksReportStatistics;
  entries: ArtworksReportEntry[];
}
