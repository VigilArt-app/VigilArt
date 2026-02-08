import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { MatchingPageSchema as base } from "../../generated/zod";

export const ArtworkMetadataLabelSchema = z.object({
  label: z.string({
    error: (e) => (e.input === undefined ? "Label is required." : undefined)
  }),
  languageCode: z.string().optional()
});
export class ArtworkMetadataLabelDTO extends createZodDto(
  ArtworkMetadataLabelSchema
) {}

export const ArtworkWebEntitySchema = z.object({
  score: z.number({
    error: (e) => (e.input === undefined ? "Score is required." : undefined)
  }),
  description: z.string({
    error: (e) =>
      e.input === undefined ? "Description is required." : undefined
  })
});
export class ArtworkWebEntityDTO extends createZodDto(ArtworkWebEntitySchema) {}

export const ArtworkMetadataSchema = z.object({
  bestGuessLabels: z.array(ArtworkMetadataLabelSchema, {
    error: (e) =>
      e.input === undefined ? "Best guess labels array is required." : undefined
  }),
  webEntities: z.array(ArtworkWebEntitySchema, {
    error: (e) =>
      e.input === undefined ? "Web entities array is required." : undefined
  })
});
export class ArtworkMetadataDTO extends createZodDto(ArtworkMetadataSchema) {}

export const MatchingPageSchema = base.extend({
  pageTitle: z.string().optional(),
  imageUrl: z.string().optional()
});

export class MatchingPageDTO extends createZodDto(MatchingPageSchema) {}

export const MatchingPageGetSchema = MatchingPageSchema.omit({
  id: true,
  reportEntryId: true
});

export class MatchingPageGetDTO extends createZodDto(MatchingPageGetSchema) {}

export const VisualSearchResultSchema = z.object({
  metadata: ArtworkMetadataSchema.nullable(),
  matchingPages: z.array(MatchingPageGetSchema, {
    error: (e) =>
      e.input === undefined ? "Matching pages array is required." : undefined
  })
});
export class VisualSearchResultDTO extends createZodDto(
  VisualSearchResultSchema
) {}
