import { z } from "zod";
import {
    DmcaProfileGetSchema,
    DmcaProfileCreateSchema,
    DmcaProfileUpdateSchema
} from "../../../schemas/Dmca/Profile";

export type DmcaProfileGet = z.infer<typeof DmcaProfileGetSchema>;
export type DmcaProfileCreate = z.infer<typeof DmcaProfileCreateSchema>;
export type DmcaProfileUpdate = z.infer<typeof DmcaProfileUpdateSchema>;
