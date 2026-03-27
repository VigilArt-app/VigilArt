import type { Artwork } from "@vigilart/shared/types";

export type { Artwork };

export interface MatchingPage {
  id: string;
  artworkId: string;
  category: string;
  url: string;
  websiteName: string;
  imageUrl: string;
  pageTitle: string;
  firstDetectedAt: string;
}

export interface ArtworkReportInsights {
  totalMatches: number;
  mostRecentSource: string;
  mostRecentDate: string | null;
  matchingPages: MatchingPage[];
}

export type ArtworkWithInsights = Artwork & {
  reportInsights?: ArtworkReportInsights;
};

export type FilterStatus = "All" | "Scanning" | "Scanned" | "Protected";

export const FILTER_STATUS_TRANSLATION_KEYS: Record<FilterStatus, string> = {
  All: "artwork_gallery_page.all",
  Scanning: "artwork_gallery_page.scanning",
  Scanned: "artwork_gallery_page.scanned",
  Protected: "artwork_gallery_page.protected",
};

export const getArtworkStatus = (artwork: ArtworkWithInsights): FilterStatus => {
  if ((artwork.reportInsights?.totalMatches || 0) > 0) return "Scanned";
  if (artwork.lastScanAt) return "Protected";
  if (!artwork.lastScanAt && artwork.createdAt) return "Scanning";
  return "Protected";
};
