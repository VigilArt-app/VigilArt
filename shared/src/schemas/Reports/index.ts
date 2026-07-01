import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ArtworksReportSchema as base } from "../../generated/zod";
import { MatchingPageSchema } from "./VisualSearchResult";
import { dateTimeStringToDate } from "../../functions";

export const ArtworksReportSchema = base.extend({
  detectionDate: dateTimeStringToDate
});

export const ArtworksReportStatisticsSchema = z.object({
  totalMatches: z.number({
    error: (e) =>
      e.input === undefined ? "Total matches is required." : undefined
  })
});
export class ArtworksReportStatisticsDTO extends createZodDto(
  ArtworksReportStatisticsSchema
) {}

export const ArtworksReportGlobalStatisticsSchema = z.object({
  totalMatches: z.number({
    error: (e) =>
      e.input === undefined ? "Total matches is required." : undefined
  })
});
export class ArtworksReportGlobalStatisticsDTO extends createZodDto(
  ArtworksReportGlobalStatisticsSchema
) {}

export class ArtworksReportDTO extends createZodDto(ArtworksReportSchema) {}

export const ArtworksReportGetSchema = ArtworksReportSchema.extend({
  matchingPages: z.array(MatchingPageSchema)
});

export class ArtworksReportGetDTO extends createZodDto(
  ArtworksReportGetSchema
) {}

export const ScanEnqueuedSchema = z.object({
  jobId: z.string()
});
export class ScanEnqueuedDTO extends createZodDto(ScanEnqueuedSchema) {}

export const ScanJobStateSchema = z.enum([
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed"
]);

export const ScanProgressSchema = z.object({
  processed: z.number(),
  total: z.number()
});

export const ScanStatusSchema = z.object({
  jobId: z.string(),
  state: ScanJobStateSchema,
  progress: ScanProgressSchema.nullable(),
  reportId: z.string().nullable(),
  error: z.string().nullable()
});
export class ScanStatusDTO extends createZodDto(ScanStatusSchema) {}

export * from "./VisualSearchResult";
