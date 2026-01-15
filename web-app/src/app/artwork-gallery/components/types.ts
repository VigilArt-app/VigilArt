export interface Artwork {
  id: string;
  userId: string;
  imageUri: string;
  originalFilename: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  lastScanAt: string | null;
}

export type FilterStatus = "All" | "Scanning" | "Scanned" | "Protected";

export const getArtworkStatus = (artwork: Artwork): FilterStatus => {
  if (artwork.lastScanAt) return "Scanned";
  if (!artwork.lastScanAt && artwork.createdAt) return "Scanning";
  return "Protected";
};
