import { z } from "zod";
import {
  NotificationTypeSchema,
  NotificationPayloadSchema,
  BaseDeviceTokenSchema,
  RegisterDeviceSchema
} from "../../schemas/Notifications";

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

export type DeviceToken = z.infer<typeof BaseDeviceTokenSchema>;

export type RegisterDevice = z.infer<typeof RegisterDeviceSchema>;
