import { z } from "zod";
import {
  PublicScanStateSchema,
  PublicScanCategoryCountSchema,
  PublicScanResultSchema,
  PublicScanEnqueuedSchema,
  PublicScanStatusSchema,
  PublicScanAllowanceSchema
} from "../../schemas";

export type PublicScanState = z.infer<typeof PublicScanStateSchema>;

export type PublicScanCategoryCount = z.infer<
  typeof PublicScanCategoryCountSchema
>;

export type PublicScanResult = z.infer<typeof PublicScanResultSchema>;

export type PublicScanEnqueued = z.infer<typeof PublicScanEnqueuedSchema>;

export type PublicScanStatus = z.infer<typeof PublicScanStatusSchema>;

export type PublicScanAllowance = z.infer<typeof PublicScanAllowanceSchema>;
