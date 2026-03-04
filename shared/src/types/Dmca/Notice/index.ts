import { z } from "zod";
import {
    DmcaNoticeGetSchema,
    DmcaNoticeCreateSchema,
    DmcaNoticeUpdateSchema,
    DmcaNoticeEmailResponseSchema,
    DmcaNoticeFileResponseSchema,
    DmcaNoticeGeneratedContentSchema
} from "../../../schemas/Dmca/Notice";

export type DmcaNoticeGet = z.infer<typeof DmcaNoticeGetSchema>;
export type DmcaNoticeCreate = z.infer<typeof DmcaNoticeCreateSchema>;
export type DmcaNoticeUpdate = z.infer<typeof DmcaNoticeUpdateSchema>;
export type DmcaNoticeEmailResponse = z.infer<typeof DmcaNoticeEmailResponseSchema>;
export type DmcaNoticeFileResponse = z.infer<typeof DmcaNoticeFileResponseSchema>;
export type DmcaNoticeGeneratedContent = z.infer<typeof DmcaNoticeGeneratedContentSchema>;
