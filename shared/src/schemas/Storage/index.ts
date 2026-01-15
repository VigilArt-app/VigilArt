import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const PresignedUrlsSchema = z.object({
  signedUrls: z.record(z.string(), z.string()),
});

export class PresignedUrlsDTO extends createZodDto(PresignedUrlsSchema) {}

export const FilenamesSchema = z.object({
  filenames: z.array(z.string()),
});

export class FilenamesDTO extends createZodDto(FilenamesSchema) {}
