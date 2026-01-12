import { z } from "zod";
import {
    DmcaNoticeGetSchema,
    DmcaNoticeCreateSchema,
    DmcaNoticeUpdateSchema
} from "../../../schemas/Dmca/Notice";

export type DmcaNoticeGet = z.infer<typeof DmcaNoticeGetSchema>;
export type DmcaNoticeCreate = z.infer<typeof DmcaNoticeCreateSchema>;
export type DmcaNoticeUpdate = z.infer<typeof DmcaNoticeUpdateSchema>;
