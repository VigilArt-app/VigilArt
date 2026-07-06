import { z } from "zod";
import { ArtworksReportSchema } from "../../schemas";
import {
  ArtworksReportGetSchema,
  ArtworksReportGlobalStatisticsSchema,
  ArtworksReportStatisticsSchema,
  ScanStatusSchema,
  ScanProgressSchema,
  ScanJobStateSchema,
  ScanEnqueuedSchema
} from "../../schemas";

export type ArtworksReport = z.infer<typeof ArtworksReportSchema>;

export type ArtworksReportGet = z.infer<typeof ArtworksReportGetSchema>;

export type ArtworksReportStatistics = z.infer<
  typeof ArtworksReportStatisticsSchema
>;

export type ArtworksReportGlobalStatistics = z.infer<
  typeof ArtworksReportGlobalStatisticsSchema
>;

export type ScanStatus = z.infer<typeof ScanStatusSchema>;

export type ScanProgress = z.infer<typeof ScanProgressSchema>;

export type ScanJobState = z.infer<typeof ScanJobStateSchema>;

export type ScanEnqueued = z.infer<typeof ScanEnqueuedSchema>;

export * from "./VisualSearchResult";
