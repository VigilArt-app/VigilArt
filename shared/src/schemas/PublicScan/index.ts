import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { WebsiteCategorySchema } from "../../generated/zod";
import { MatchingPageGetSchema } from "../Reports/VisualSearchResult";

// How many matches an anonymous visitor sees. The cut is applied on the server:
// returning the full list and hiding the rest in the UI would make the account
// gate decorative, since the payload is one devtools panel away.
export const PUBLIC_SCAN_PREVIEW_MATCHES = 3;

export const PublicScanStateSchema = z.enum([
  "pending",
  "running",
  "done",
  "failed"
]);

export const PublicScanCategoryCountSchema = z.object({
  category: WebsiteCategorySchema,
  count: z.number()
});

export const PublicScanResultSchema = z.object({
  // The true total across the whole scan, even though `matches` is truncated:
  // it is the number the page leads with.
  totalMatches: z.number(),
  matches: z.array(MatchingPageGetSchema),
  categories: z.array(PublicScanCategoryCountSchema)
});
export class PublicScanResultDTO extends createZodDto(PublicScanResultSchema) {}

export const PublicScanEnqueuedSchema = z.object({
  scanId: z.string()
});
export class PublicScanEnqueuedDTO extends createZodDto(
  PublicScanEnqueuedSchema
) {}

export const PublicScanStatusSchema = z.object({
  scanId: z.string(),
  state: PublicScanStateSchema,
  result: PublicScanResultSchema.nullable(),
  error: z.string().nullable()
});
export class PublicScanStatusDTO extends createZodDto(PublicScanStatusSchema) {}

export const PublicScanAllowanceSchema = z.object({
  remainingToday: z.number()
});
export class PublicScanAllowanceDTO extends createZodDto(
  PublicScanAllowanceSchema
) {}
