import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { MatchingPageSchema as base } from "../../generated/zod";
import {
  MATCHING_PAGE_CREATE_BATCH_MAX_SIZE
} from "../../constants";
import { dateTimeStringToDate } from "../../functions";

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
  firstDetectedAt: dateTimeStringToDate
});

export class MatchingPageDTO extends createZodDto(MatchingPageSchema) {}

export const MatchingPageCreateSchema = MatchingPageSchema.pick({
  artworkId: true,
  url: true,
  category: true,
  websiteName: true,
  imageUrl: true,
  pageTitle: true
}).extend({
  artworkId: z.uuid({
    error: (e) =>
      e.input === undefined ? "Artwork id is required." : undefined
  }),
  url: z.string({
    error: (e) => (e.input === undefined ? "Url is required." : undefined)
  }),
  imageUrl: z.string().optional(),
  pageTitle: z.string().optional()
});

export class MatchingPageCreateDTO extends createZodDto(
  MatchingPageCreateSchema
) {}

export const MatchingPageCreateManySchema = z
  .array(MatchingPageCreateSchema)
  .max(
    MATCHING_PAGE_CREATE_BATCH_MAX_SIZE,
    `Can only select up to ${MATCHING_PAGE_CREATE_BATCH_MAX_SIZE}`
  );

export class MatchingPageCreateManyDTO extends createZodDto(
  MatchingPageCreateManySchema
) {}

export const MatchingPageCreateManyResponseSchema = z.object({
  count: z.number(),
  matchingPages: z.array(
    MatchingPageSchema.pick({
      id: true,
      artworkId: true,
      imageUrl: true
    })
  )
});

export class MatchingPageCreateManyResponseDTO extends createZodDto(
  MatchingPageCreateManyResponseSchema
) {}

export const MatchingPageGetSchema = MatchingPageSchema.extend({
  pageTitle: z.string().optional(),
  imageUrl: z.string().optional()
}).omit({
  id: true,
  artworkId: true,
  firstDetectedAt: true
});

export class MatchingPageGetDTO extends createZodDto(MatchingPageGetSchema) {}

export const MatchingPageUpdateSchema = MatchingPageSchema.pick({
  artworkId: true,
  category: true
}).partial();

export class MatchingPageUpdateDTO extends createZodDto(
  MatchingPageUpdateSchema
) {}

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
