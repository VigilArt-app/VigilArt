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
    street: true,
    aptSuite: true,
    city: true,
    postalCode: true,
    country: true,
    email: true,
    phone: true,
    signature: true
});
export class DmcaProfileCreateDTO extends createZodDto(DmcaProfileCreateSchema) {}

export const DmcaProfileUpdateSchema = DmcaProfileCreateSchema.partial();
export class DmcaProfileUpdateDTO extends createZodDto(DmcaProfileUpdateSchema) {}
