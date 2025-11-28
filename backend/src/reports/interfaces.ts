export interface IArtworkStatistics {
  totalMatches: number;
  totalFullMatchingImages: number;
  totalPartialMatchingImages: number;
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

export interface IMatchingImage {
  url: string;
  category: string;
  websiteName: string;
  pageUrl?: string;
  pageTitle?: string;
}

export interface IArtworkIndividualReport {
  detectionDate: string;
  statistics: IArtworkStatistics | null;
  metadata: IArtworkMetadata | null;
  fullMatchingImages: IMatchingImage[];
  partialMatchingImages: IMatchingImage[];
}
