import { z } from "zod";
import {
    DmcaPlatformGetSchema,
    DmcaPlatformCreateSchema,
    DmcaPlatformUpdateSchema
} from "../../../schemas/Dmca/Platform";

export type DmcaPlatformGetType = z.infer<typeof DmcaPlatformGetSchema>;
export type DmcaPlatformCreateType = z.infer<typeof DmcaPlatformCreateSchema>;
export type DmcaPlatformUpdateType = z.infer<typeof DmcaPlatformUpdateSchema>;
