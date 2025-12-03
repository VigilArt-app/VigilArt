import { WebsiteCategory } from "src/generated/prisma";

export interface IVisualSearchResult {
  metadata: IArtworkMetadata | null;
  matchingPages: IMatchingPage[];
}

export interface IArtworkStatistics {
  totalMatches: number;
  // totalUncreditedMatches: number;
}

export interface IArtworkMetadataLabel {
  label: string;
  languageCode?: string;
}

export interface IArtworkWebEntity {
  score: number;
  description: string;
}

export interface IArtworkMetadata {
  bestGuessLabels: IArtworkMetadataLabel[];
  webEntities: IArtworkWebEntity[];
}

export interface IMatchingPage {
  url: string;
  pageTitle?: string;
  category: WebsiteCategory | null;
  websiteName: string | null;
  imageUrl?: string;
}

export interface ReportDetails {
  artworkId: string;
  detectionDate: string;
  statistics: IArtworkStatistics;
  matchingPages: IMatchingPage[];
}

export interface ArtworksReport {
  detectionDate: string;
  totalMatches: number;
  statistics: IArtworkStatistics;
  details: ReportDetails[];
}
