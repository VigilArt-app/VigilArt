import type { Artwork } from "@vigilart/shared/types";

export type { Artwork };

export type FilterStatus = "All" | "Scanning" | "Scanned" | "Protected";

export const FILTER_STATUS_TRANSLATION_KEYS: Record<FilterStatus, string> = {
  All: "artwork_gallery_page.all",
  Scanning: "artwork_gallery_page.scanning",
  Scanned: "artwork_gallery_page.scanned",
  Protected: "artwork_gallery_page.protected",
};

export const getArtworkStatus = (artwork: Artwork): FilterStatus => {
  if (artwork.lastScanAt) return "Scanned";
  if (!artwork.lastScanAt && artwork.createdAt) return "Scanning";
  return "Protected";
};
