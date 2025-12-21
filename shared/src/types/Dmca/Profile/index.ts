import { z } from "zod";
import {
    DmcaProfileGetSchema,
    DmcaProfileCreateSchema,
    DmcaProfileUpdateSchema
} from "../../../schemas/Dmca/Profile";

export type DmcaProfileGetType = z.infer<typeof DmcaProfileGetSchema>;
export type DmcaProfileCreateType = z.infer<typeof DmcaProfileCreateSchema>;
export type DmcaProfileUpdateType = z.infer<typeof DmcaProfileUpdateSchema>;
