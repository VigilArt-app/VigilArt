import { Module } from "@nestjs/common";

import { AppService } from "./app.service";

import { AppController } from "./app.controller";

import { ZodValidationPipe } from "nestjs-zod";
import { ResponseWrapperInterceptor } from "./common/interceptors/response-wrapper.interceptor";
import { APP_PIPE, APP_INTERCEPTOR } from "@nestjs/core";

import { UsersModule } from "./users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { AuthModule } from "./auth/auth.module";
import { VisionModule } from "./vision/vision.module";
import { ArtworksModule } from "./artworks/artworks.module";
import { ReportsModule } from "./reports/reports.module";
import { PrismaModule } from "./prisma/prisma.module";
import { StorageModule } from "./storage/storage.module";
import { DmcaPlatformModule } from "./dmca/platform/platform.module";
import { DmcaProfileModule } from "./dmca/profile/profile.module";
import { DmcaNoticeModule } from "./dmca/notice/notice.module";
import { GoogleLensModule } from "./googlelens/googlelens.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env"
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>("REDIS_URL")
        }
      })
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [createKeyv(config.getOrThrow<string>("REDIS_URL"))],
        ttl: 1 * 60 * 60 * 1000
      })
    }),
    UsersModule,
    AuthModule,
    VisionModule,
    ArtworksModule,
    ReportsModule,
    PrismaModule,
    StorageModule,
    DmcaPlatformModule,
    DmcaProfileModule,
    DmcaNoticeModule,
    GoogleLensModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseWrapperInterceptor
    }
  ]
})
export class AppModule {}
