import { z } from "zod";
import { UploadUrlGetSchema, UploadUrlsGetSchema } from "../../schemas/Storage";
import { StoragePrefixEnum } from "../../enums";

export type UploadUrlGet = z.infer<typeof UploadUrlGetSchema>;

export type UploadUrlsGet = z.infer<typeof UploadUrlsGetSchema>;

export type StoragePrefix = z.infer<typeof StoragePrefixEnum>;