import type { Artwork } from "@vigilart/shared/types";

export type { Artwork };

export type FilterStatus = "All" | "Scanning" | "Scanned" | "Protected";

export const getArtworkStatus = (artwork: Artwork): FilterStatus => {
  if (artwork.lastScanAt) return "Scanned";
  if (!artwork.lastScanAt && artwork.createdAt) return "Scanning";
  return "Protected";
};
