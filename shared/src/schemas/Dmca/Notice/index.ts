import { createZodDto } from "nestjs-zod";
import { DmcaNoticeSchema } from "../../../generated/zod";
import { dateTimeStringToDate } from "../../../constants";

export const DmcaNoticeGetSchema = DmcaNoticeSchema.extend({
    createdAt: dateTimeStringToDate,
    updatedAt: dateTimeStringToDate,
    submittedAt: dateTimeStringToDate.nullable()
});
export class DmcaNoticeGetDTO extends createZodDto(DmcaNoticeGetSchema) {}

export const DmcaNoticeCreateSchema = DmcaNoticeGetSchema.pick({
    dmcaPlatformCode: true,
    body: true
});
export class DmcaNoticeCreateDTO extends createZodDto(DmcaNoticeCreateSchema) {}

export const DmcaNoticeUpdateSchema = DmcaNoticeGetSchema.pick({
    dmcaPlatformCode: true,
    status: true,
    body: true
});
export class DmcaNoticeUpdateDTO extends createZodDto(DmcaNoticeUpdateSchema) {}
