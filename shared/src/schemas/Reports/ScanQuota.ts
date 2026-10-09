import { z } from "zod";

export const ScanQuotaSchema = z.object({
  remaining: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  nextAvailableAt: z.string().datetime().nullable()
});
