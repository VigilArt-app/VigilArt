import { z } from "zod";
import { UploadUrlGetSchema, UploadUrlsGetSchema } from "../../schemas/Storage";

export type UploadUrlGet = z.infer<typeof UploadUrlGetSchema>;

export type UploadUrlsGet = z.infer<typeof UploadUrlsGetSchema>;
