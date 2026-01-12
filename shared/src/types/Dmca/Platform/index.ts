import { z } from "zod";
import {
    DmcaPlatformGetSchema,
    DmcaPlatformCreateSchema,
    DmcaPlatformUpdateSchema
} from "../../../schemas/Dmca/Platform";

export type DmcaPlatformGet = z.infer<typeof DmcaPlatformGetSchema>;
export type DmcaPlatformCreate = z.infer<typeof DmcaPlatformCreateSchema>;
export type DmcaPlatformUpdate = z.infer<typeof DmcaPlatformUpdateSchema>;
