import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ArtworksReportSchema as base } from "../../generated/zod";
import { MatchingPageSchema } from "./VisualSearchResult";
import { dateTimeStringToDate } from "../../constants";

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

export * from "./VisualSearchResult";
