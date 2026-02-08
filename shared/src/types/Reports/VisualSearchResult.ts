import { z } from "zod";
import {
  AggregatedVisualSearchResultsSchema,
  ArtworkMetadataLabelSchema,
  ArtworkMetadataSchema,
  ArtworkWebEntitySchema,
  VisualSearchResultSchema,
  MatchingPageSchema,
  MatchingPageGetSchema
} from "../../schemas/Reports";

export type ArtworkMetadataLabel = z.infer<typeof ArtworkMetadataLabelSchema>;

export type ArtworkWebEntity = z.infer<typeof ArtworkWebEntitySchema>;

export type ArtworkMetadata = z.infer<typeof ArtworkMetadataSchema>;

export type MatchingPage = z.infer<typeof MatchingPageSchema>;

export type MatchingPageGet = z.infer<typeof MatchingPageGetSchema>;

export type VisualSearchResult = z.infer<typeof VisualSearchResultSchema>;

export type AggregatedVisualSearchResults = z.infer<
  typeof AggregatedVisualSearchResultsSchema
>;
