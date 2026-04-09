import { z } from "zod";
import { ArtworksReportSchema } from "../../schemas";
import {
  ArtworksReportGetSchema,
  ArtworksReportGlobalStatisticsSchema,
  ArtworksReportStatisticsSchema
} from "../../schemas";

export type ArtworksReport = z.infer<typeof ArtworksReportSchema>;

export type ArtworksReportGet = z.infer<typeof ArtworksReportGetSchema>;

export type ArtworksReportStatistics = z.infer<
  typeof ArtworksReportStatisticsSchema
>;

export type ArtworksReportGlobalStatistics = z.infer<
  typeof ArtworksReportGlobalStatisticsSchema
>;

export * from "./VisualSearchResult";
