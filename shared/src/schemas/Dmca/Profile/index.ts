import { createZodDto } from "nestjs-zod";
import { DmcaProfileSchema } from "../../../generated/zod";
import { dateTimeStringToDate } from "../../../constants";

export const DmcaProfileGetSchema = DmcaProfileSchema.extend({
    createdAt: dateTimeStringToDate,
    updatedAt: dateTimeStringToDate
});
export class DmcaProfileGetDTO extends createZodDto(DmcaProfileGetSchema) {}

export const DmcaProfileCreateSchema = DmcaProfileGetSchema.pick({
    fullName: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    postalCode: true,
    country: true,
    email: true,
    phone: true,
    signature: true
});
export class DmcaProfileCreateDTO extends createZodDto(DmcaProfileCreateSchema) {}

export const DmcaProfileUpdateSchema = DmcaProfileCreateSchema;
export class DmcaProfileUpdateDTO extends createZodDto(DmcaProfileUpdateSchema) {}
