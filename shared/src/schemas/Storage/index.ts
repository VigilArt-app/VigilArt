import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const UploadUrlGetSchema = z.object({
  storageKey: z.string(),
  presignedUrl: z.string(),
});

export class UploadUrlGetDTO extends createZodDto(UploadUrlGetSchema) {}

export const UploadUrlsGetSchema = z.record(z.string(), UploadUrlGetSchema);

export class UploadUrlsGetDTO extends createZodDto(UploadUrlsGetSchema) {}

export const DownloadUrlsGetSchema = z.record(z.string(), z.string());

export class DownloadUrlsGetDTO extends createZodDto(DownloadUrlsGetSchema) {}

export const UploadUrlsRequestSchema = z.object({
  filenames: z.array(z.string()),
});

export class UploadUrlsRequestDTO extends createZodDto(
  UploadUrlsRequestSchema,
) {}

export const DownloadUrlsRequestSchema = z.object({
  storageKeys: z.array(z.string()),
});

export class DownloadUrlsRequestDTO extends createZodDto(
  DownloadUrlsRequestSchema,
) {}
