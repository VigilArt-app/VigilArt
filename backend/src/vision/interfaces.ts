import { WebsiteCategory } from "src/generated/prisma";

export interface IArtworkIndividualReport {
  detectionDate: string;
  statistics: IArtworkStatistics | null;
  metadata: IArtworkMetadata | null;
  matchingPages: IMatchingPage[];
}

export interface IArtworkStatistics {
  totalMatches: number;
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
