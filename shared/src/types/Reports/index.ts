import { z } from "zod";
import {
  ArtworksReportEntryStatisticsSchema,
  ArtworksReportSchema,
  ArtworksReportGetSchema,
  ArtworksReportStatisticsSchema,
  GetArtworksMatchesSchema,
  ArtworksReportEntrySchema,
  ArtworksReportEntryGetSchema
} from "../../schemas/Reports";

export type GetArtworksMatches = z.infer<typeof GetArtworksMatchesSchema>;

export type ArtworksReportEntryStatistics = z.infer<
  typeof ArtworksReportEntryStatisticsSchema
>;

export type ArtworksReportEntry = z.infer<typeof ArtworksReportEntrySchema>;

export type ArtworksReportEntryGet = z.infer<
  typeof ArtworksReportEntryGetSchema
>;

export type ArtworksReportStatistics = z.infer<
  typeof ArtworksReportStatisticsSchema
>;

export type ArtworksReport = z.infer<typeof ArtworksReportSchema>;

export type ArtworksReportGet = z.infer<typeof ArtworksReportGetSchema>;

export * from "./VisualSearchResult";
