import type {
  Artwork,
  MatchingPage as SharedMatchingPage,
} from "@vigilart/shared/types";

export type { Artwork };

export type MatchingPage = Omit<SharedMatchingPage, "firstDetectedAt"> & {
  firstDetectedAt: string;
};

export interface ArtworkReportInsights {
  totalMatches: number;
  mostRecentSource: string;
  mostRecentDate: string | null;
  matchingPages: MatchingPage[];
}

export interface ArtworkReportInsightsResult {
  available: boolean;
  insights: Record<string, ArtworkReportInsights>;
}

export type ArtworkWithInsights = Artwork & {
  reportInsights?: ArtworkReportInsights;
  reportInsightsAvailable?: boolean;
};

export type ArtworkStatus = "not_scanned" | "no_matches" | "matches_found" | "results_unavailable";
export type FilterStatus = "All" | ArtworkStatus;

export const FILTER_STATUS_TRANSLATION_KEYS: Record<FilterStatus, string> = {
  All: "artwork_gallery_page.all",
  not_scanned: "artwork_gallery_page.not_scanned",
  no_matches: "artwork_gallery_page.no_matches_found",
  matches_found: "artwork_gallery_page.matches_found",
  results_unavailable: "artwork_gallery_page.results_unavailable",
};

export const getArtworkStatus = (artwork: ArtworkWithInsights): ArtworkStatus => {
  if ((artwork.reportInsights?.totalMatches || 0) > 0) return "matches_found";
  if (!artwork.lastScanAt) return "not_scanned";
  // Failed or missing history cannot prove that no matches were found.
  return artwork.reportInsightsAvailable === true ? "no_matches" : "results_unavailable";
};

export const getArtworkResultsState = (
  artwork: ArtworkWithInsights,
): "not_scanned" | "unavailable" | "available" => {
  if (getArtworkStatus(artwork) === "not_scanned") return "not_scanned";
  return artwork.reportInsightsAvailable === true ? "available" : "unavailable";
};
