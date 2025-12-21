import { createZodDto } from "nestjs-zod";
import { DmcaPlatformSchema } from "../../../generated/zod";
import { dateTimeStringToDate } from "../../../constants";

export const DmcaPlatformGetSchema = DmcaPlatformSchema.extend({
    createdAt: dateTimeStringToDate,
    updatedAt: dateTimeStringToDate
});
export class DmcaPlatformGetDTO extends createZodDto(DmcaPlatformGetSchema) {}

export const DmcaPlatformCreateSchema = DmcaPlatformGetSchema.pick({
    code: true,
    displayName: true,
    domain: true,
    dmcaUrl: true
});
export class DmcaPlatformCreateDTO extends createZodDto(DmcaPlatformCreateSchema) {}

export const DmcaPlatformUpdateSchema = DmcaPlatformGetSchema.pick({
    displayName: true,
    domain: true,
    dmcaUrl: true
});
export class DmcaPlatformUpdateDTO extends createZodDto(DmcaPlatformUpdateSchema) {}
