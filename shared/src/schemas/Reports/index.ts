import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { MatchingPageSchema } from "./VisualSearchResult";
import { dateTimeStringToDate } from "../../constants";

export const GetArtworksMatchesSchema = z.object({
  websiteCategory: z.string().optional(),
});
export class GetArtworksMatchesDTO extends createZodDto(
  GetArtworksMatchesSchema
) {}

export const ArtworksReportEntryStatisticsSchema = z.object({
  totalMatches: z.number({
    error: (e) =>
      e.input === undefined ? "Total matches is required." : undefined,
  }),
});
export class ArtworksReportEntryStatisticsDTO extends createZodDto(
  ArtworksReportEntryStatisticsSchema
) {}

export const ArtworksReportEntrySchema = z.object({
  artworkId: z.string({
    error: (e) =>
      e.input === undefined ? "Artwork ID is required." : undefined,
  }),
  statistics: ArtworksReportEntryStatisticsSchema.refine(
    (val) => val !== undefined,
    {
      message: "Artworks report entry statistics is required.",
    }
  ),
  matchingPages: z.array(MatchingPageSchema, {
    error: (e) =>
      e.input === undefined ? "Matching pages array is required." : undefined,
  }),
});
export class ArtworksReportEntryDTO extends createZodDto(
  ArtworksReportEntrySchema
) {}

export const ArtworksReportStatisticsSchema = z.object({
  totalMatches: z.number({
    error: (e) =>
      e.input === undefined ? "Total matches is required." : undefined,
  }),
});
export class ArtworksReportStatisticsDTO extends createZodDto(
  ArtworksReportStatisticsSchema
) {}

export const ArtworksReportSchema = z.object({
  detectionDate: dateTimeStringToDate,
  statistics: ArtworksReportStatisticsSchema.refine(
    (val) => val !== undefined,
    {
      message: "Artworks report statistics is required.",
    }
  ),
  entries: z.array(ArtworksReportEntrySchema, {
    error: (e) =>
      e.input === undefined ? "Entries array is required." : undefined,
  }),
});
export class ArtworksReportDTO extends createZodDto(ArtworksReportSchema) {}

export const AggregatedVisualSearchResultsSchema =
  ArtworksReportEntrySchema.omit({
    artworkId: true,
  });
export class AggregatedVisualSearchResultsDTO extends createZodDto(
  AggregatedVisualSearchResultsSchema
) {}

export * from "./VisualSearchResult";
