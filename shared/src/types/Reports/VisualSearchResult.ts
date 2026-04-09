import { z } from "zod";
import {
  ArtworkMetadataLabelSchema,
  ArtworkMetadataSchema,
  ArtworkWebEntitySchema,
  VisualSearchResultSchema,
  MatchingPageGetSchema,
  MatchingPageCreateManySchema
} from "../../schemas/Reports";
import { MatchingPageSchema } from "../../schemas";

export type ArtworkMetadataLabel = z.infer<typeof ArtworkMetadataLabelSchema>;

export type ArtworkWebEntity = z.infer<typeof ArtworkWebEntitySchema>;

export type ArtworkMetadata = z.infer<typeof ArtworkMetadataSchema>;

export type MatchingPage = z.infer<typeof MatchingPageSchema>;

export type MatchingPageGet = z.infer<typeof MatchingPageGetSchema>;

export type MatchingPageCreateMany = z.infer<typeof MatchingPageCreateManySchema>;

export type VisualSearchResult = z.infer<typeof VisualSearchResultSchema>;
