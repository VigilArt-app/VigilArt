import { createZodDto } from "nestjs-zod";
import { DmcaNoticeSchema } from "../../../generated/zod";
import { dateTimeStringToDate } from "../../../functions";
import { z } from "zod";

export const DmcaNoticeGetSchema = DmcaNoticeSchema.extend({
    payload: z.any(),
    createdAt: dateTimeStringToDate,
    updatedAt: dateTimeStringToDate,
    submittedAt: dateTimeStringToDate.nullable()
});
export class DmcaNoticeGetDTO extends createZodDto(DmcaNoticeGetSchema) {}

export const DmcaNoticeCreateSchema = DmcaNoticeGetSchema.pick({
    dmcaPlatformSlug: true,
    payload: true,
    artworkId: true
}).extend({
    userId: z.string()
  }
);
export class DmcaNoticeCreateDTO extends createZodDto(DmcaNoticeCreateSchema) {}

export const DmcaNoticeUpdateSchema = DmcaNoticeGetSchema.pick({
    dmcaPlatformSlug: true,
    payload: true
}).extend({
    userId: z.string()
  }
);
export class DmcaNoticeUpdateDTO extends createZodDto(DmcaNoticeUpdateSchema) {}

export const DmcaNoticeEmailResponseSchema = z.object({
  to: z.string(),
  subject: z.string(),
  body: z.string(),
});
export class DmcaNoticeEmailResponseDTO extends createZodDto(DmcaNoticeEmailResponseSchema) {}

export const DmcaNoticeFileResponseSchema = z.object({
  url: z.url(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative()
});
export class DmcaNoticeFileResponseDTO extends createZodDto(DmcaNoticeFileResponseSchema) {}

export const DmcaNoticeGeneratedContentSchema = z.object({
  email: DmcaNoticeEmailResponseSchema,
  pdf: DmcaNoticeFileResponseSchema
});
export class DmcaNoticeGeneratedContentDTO extends createZodDto(DmcaNoticeGeneratedContentSchema) {}

export * from "./data";
