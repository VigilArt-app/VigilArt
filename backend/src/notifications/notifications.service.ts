import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { NotificationPayload, DeviceToken } from "@vigilart/shared";
import { RegisterDeviceDTO } from "@vigilart/shared";
import {
  type App,
  initializeApp,
  deleteApp,
  cert
} from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import firebaseKeyJSON from "../../keys/vigilart-firebase.json";

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: App | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (!firebaseKeyJSON.project_id || !firebaseKeyJSON.client_email || !firebaseKeyJSON.private_key) {
      this.logger.warn("Firebase service account key is incomplete, push notifications are disabled.");
      return;
    }

    this.firebaseApp = initializeApp({
      credential: cert({
        projectId: firebaseKeyJSON.project_id,
        clientEmail: firebaseKeyJSON.client_email,
        privateKey: firebaseKeyJSON.private_key
      })
    });
    this.logger.log("Firebase Admin SDK initialised.");
  }

  async onModuleDestroy() {
    if (this.firebaseApp) {
      await deleteApp(this.firebaseApp);
      this.logger.log("Firebase Admin SDK destroyed.");
    }
  }

  async registerDevice(
    userId: string,
    device: RegisterDeviceDTO
  ): Promise<DeviceToken> {
    this.logger.log(`Registering ${device.platform} device for user ${userId}`);
    return this.prisma.deviceToken.upsert({
      where: { token: device.token },
      update: { userId, platform: device.platform },
      create: {
        userId,
        token: device.token,
        platform: device.platform
      }
    });
  }

  async unregisterDevice(userId: string, token: string): Promise<void> {
    this.logger.log(`Unregistering device token for user ${userId}`);
    await this.prisma.deviceToken.deleteMany({
      where: { token, userId }
    });
  }

  async send(
    userId: string,
    notification: NotificationPayload
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.debug("Firebase not configured, skipping push notification.");
      return;
    }

    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true, id: true }
    });
    if (deviceTokens.length === 0) {
      this.logger.debug(`No device tokens found for user ${userId}, skipping.`);
      return;
    }

    const tokens = deviceTokens.map((d) => d.token);
    const messaging = getMessaging(this.firebaseApp);
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        type: notification.type,
        ...notification.data
      }
    });

    if (response.failureCount > 0) {
      const staleTokenIds: string[] = [];

      response.responses.forEach((resp, i) => {
        if (resp.error) {
          const code = resp.error.code;
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token"
          )
            staleTokenIds.push(deviceTokens[i].id);
          else
            this.logger.warn(`FCM error for token ${tokens[i]}: ${resp.error.message}`);
        }
      });

      if (staleTokenIds.length > 0) {
        await this.prisma.deviceToken.deleteMany({
          where: { id: { in: staleTokenIds } }
        });
        this.logger.log(`Cleaned up ${staleTokenIds.length} stale device token(s).`);
      }
    }
    this.logger.log(`Notification sent to ${response.successCount}/${tokens.length} device(s) for user ${userId}.`);
  }

  async sendToMany(
    userIds: string[],
    notification: NotificationPayload
  ): Promise<void> {
    await Promise.allSettled(
      userIds.map((id) => this.send(id, notification))
    );
  }
}
