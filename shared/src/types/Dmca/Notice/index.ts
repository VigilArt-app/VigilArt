import { z } from "zod";
import {
    DmcaNoticeGetSchema,
    DmcaNoticeCreateSchema,
    DmcaNoticeUpdateSchema
} from "../../../schemas/Dmca/Notice";

export type DmcaNoticeGetType = z.infer<typeof DmcaNoticeGetSchema>;
export type DmcaNoticeCreateType = z.infer<typeof DmcaNoticeCreateSchema>;
export type DmcaNoticeUpdateType = z.infer<typeof DmcaNoticeUpdateSchema>;
