import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { dateTimeStringToDate } from "../../functions";
import { DeviceTokenSchema, DevicePlatformSchema } from "../../generated/zod";

export const NotificationTypeSchema = z.enum([
  "REPORT_COMPLETED"
]);

export const NotificationPayloadSchema = z.object({
  type: NotificationTypeSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string(), z.string()).optional()
});
export class NotificationPayloadDTO extends createZodDto(NotificationPayloadSchema) {}

export const BaseDeviceTokenSchema = DeviceTokenSchema.extend({
  userId: z.uuid(),
  createdAt: dateTimeStringToDate,
  updatedAt: dateTimeStringToDate
});
export class DeviceTokenDTO extends createZodDto(BaseDeviceTokenSchema) {}

export const RegisterDeviceSchema = z.object({
  token: z.string({
    error: (e) =>
      e.input === undefined ? "Device token is required." : undefined
  }).min(1, "Device token must not be empty."),
  platform: DevicePlatformSchema
});
export class RegisterDeviceDTO extends createZodDto(RegisterDeviceSchema) {}
