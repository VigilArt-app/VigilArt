import { z } from "zod";
import {
  ArtworksReportEntrySchema,
  ArtworksReportEntryStatisticsSchema,
  ArtworksReportSchema,
  ArtworksReportStatisticsSchema,
  GetArtworksMatchesSchema,
} from "../../schemas/Reports";

export type GetArtworksMatches = z.infer<typeof GetArtworksMatchesSchema>;

export type ArtworksReportEntryStatistics = z.infer<
  typeof ArtworksReportEntryStatisticsSchema
>;

export type ArtworksReportEntry = z.infer<typeof ArtworksReportEntrySchema>;

export type ArtworksReportStatistics = z.infer<
  typeof ArtworksReportStatisticsSchema
>;

export type ArtworksReport = z.infer<typeof ArtworksReportSchema>;

export * from "./VisualSearchResult";
