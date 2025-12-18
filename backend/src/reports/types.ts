import { ArtworksReportEntry } from "./interfaces";

export type AggregatedVisualSearchResults = Omit<
  ArtworksReportEntry,
  "artworkId"
>;
