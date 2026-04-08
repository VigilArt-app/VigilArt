import type { MatchingPage as SharedMatchingPage } from "@vigilart/shared/types";

export type MatchingPage = Omit<SharedMatchingPage, "firstDetectedAt"> & {
  firstDetectedAt: string;
};

export interface Artwork {
  id: string;
  originalFilename: string;
  title: string;
  description?: string;
  storageKey?: string;
}

export interface ScanRow {
  artworkId: string;
  title: string;
  imageUrl?: string;
  matches: number;
  creditedMatches: number;
  mostRecentSource: string;
  mostRecentDate: string;
  matchingPages: MatchingPage[];
}

export interface ArtworksReportSummary {
  id: string;
  detectionDate: string;
}

export interface ArtworksReportDetails {
  id: string;
  detectionDate: string;
  matchingPages: MatchingPage[];
}

export type SortField = "title" | "matches" | "creditedMatches" | "mostRecentDate";
export type SortDirection = "asc" | "desc" | null;
