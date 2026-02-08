import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import {
  ArtworksReportEntrySchema as BaseArtworksReportEntry,
  ArtworksReportSchema as BaseArtworksReport,
  MatchingPageSchema
} from "../../generated/zod";
import { dateTimeStringToDate } from "../../constants";
import { MatchingPageGetSchema } from "./VisualSearchResult";

export const GetArtworksMatchesSchema = z.object({
  websiteCategory: z.string().optional()
});
export class GetArtworksMatchesDTO extends createZodDto(
  GetArtworksMatchesSchema
) {}

export const ArtworksReportEntryStatisticsSchema = z.object({
  totalMatches: z.number({
    error: (e) =>
      e.input === undefined ? "Total matches is required." : undefined
  })
});
export class ArtworksReportEntryStatisticsDTO extends createZodDto(
  ArtworksReportEntryStatisticsSchema
) {}

export const ArtworksReportEntrySchema = BaseArtworksReportEntry.extend({
  matchingPages: z.array(MatchingPageSchema)
});

export class ArtworksReportEntryDTO extends createZodDto(
  ArtworksReportEntrySchema
) {}

export const ArtworksReportEntryGetSchema = ArtworksReportEntrySchema.omit({
  id: true,
  artworkReportId: true
}).extend({
  matchingPages: z.array(MatchingPageGetSchema)
});

export class ArtworksReportEntryGetDTO extends createZodDto(
  ArtworksReportEntryGetSchema
) {}

export const ArtworksReportStatisticsSchema = z.object({
  totalMatches: z.number({
    error: (e) =>
      e.input === undefined ? "Total matches is required." : undefined
  })
});
export class ArtworksReportStatisticsDTO extends createZodDto(
  ArtworksReportStatisticsSchema
) {}

export const ArtworksReportSchema = BaseArtworksReport.extend({
  detectionDate: dateTimeStringToDate,
  entries: z.array(ArtworksReportEntrySchema)
});
export class ArtworksReportDTO extends createZodDto(ArtworksReportSchema) {}

export const ArtworksReportGetSchema = ArtworksReportSchema.omit({
  id: true,
  userId: true
}).extend({
  entries: z.array(ArtworksReportEntryGetSchema)
});
export class ArtworksReportGetDTO extends createZodDto(
  ArtworksReportGetSchema
) {}

export const AggregatedVisualSearchResultsSchema =
  ArtworksReportEntrySchema.extend({
    matchingPages: z.array(MatchingPageGetSchema)
  }).omit({
    artworkId: true,
    artworkReportId: true,
    id: true
  });

export class AggregatedVisualSearchResultsDTO extends createZodDto(
  AggregatedVisualSearchResultsSchema
) {}

export * from "./VisualSearchResult";
