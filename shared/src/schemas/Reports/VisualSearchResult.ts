import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { WebsiteCategorySchema } from "../../generated/zod";

export const ArtworkMetadataLabelSchema = z.object({
  label: z.string({
    error: (e) => (e.input === undefined ? "Label is required." : undefined),
  }),
  languageCode: z.string().optional(),
});
export class ArtworkMetadataLabelDTO extends createZodDto(
  ArtworkMetadataLabelSchema
) {}

export const ArtworkWebEntitySchema = z.object({
  score: z.number({
    error: (e) => (e.input === undefined ? "Score is required." : undefined),
  }),
  description: z.string({
    error: (e) =>
      e.input === undefined ? "Description is required." : undefined,
  }),
});
export class ArtworkWebEntityDTO extends createZodDto(ArtworkWebEntitySchema) {}

export const ArtworkMetadataSchema = z.object({
  bestGuessLabels: z.array(ArtworkMetadataLabelSchema, {
    error: (e) =>
      e.input === undefined
        ? "Best guess labels array is required."
        : undefined,
  }),
  webEntities: z.array(ArtworkWebEntitySchema, {
    error: (e) =>
      e.input === undefined ? "Web entities array is required." : undefined,
  }),
});
export class ArtworkMetadataDTO extends createZodDto(ArtworkMetadataSchema) {}

export const MatchingPageSchema = z.object({
  url: z.string({
    error: (e) => (e.input === undefined ? "Url is required." : undefined),
  }),
  pageTitle: z.string().optional(),
  category: WebsiteCategorySchema.refine((val) => val !== undefined, {
    message: "Website category is required.",
  }).nullable(),
  websiteName: z.string().nullable(),
  imageUrl: z.string().optional(),
});
export class MatchingPageDTO extends createZodDto(MatchingPageSchema) {}

export const VisualSearchResultSchema = z.object({
  metadata: ArtworkMetadataSchema.nullable(),
  matchingPages: z.array(MatchingPageSchema, {
    error: (e) =>
      e.input === undefined ? "Matching pages array is required." : undefined,
  }),
});
export class VisualSearchResultDTO extends createZodDto(
  VisualSearchResultSchema
) {}
