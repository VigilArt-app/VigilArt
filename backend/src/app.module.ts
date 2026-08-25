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
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
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
import { SerpApiLensModule } from "./serpapilens/serpapilens.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { VisualSearchModule } from "./visualsearch/visualsearch.module";
import { TurnstileModule } from "./turnstile/turnstile.module";
import { PublicScanModule } from "./public-scan/public-scan.module";
import {
  PUBLIC_SCAN_THROTTLER,
  PUBLIC_SCAN_TTL_MS,
  PUBLIC_SCAN_LIMIT,
  PUBLIC_POLL_THROTTLER,
  PUBLIC_POLL_TTL_MS,
  PUBLIC_POLL_LIMIT
} from "./common/throttler.constants";

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
    // Registered without an APP_GUARD on purpose: applied per route via
    // PublicThrottlerGuard. A global guard would also throttle the dashboard's
    // own 2-second scan polling. Counters live in Redis so they survive a
    // restart and are shared across containers.
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: PUBLIC_SCAN_THROTTLER,
            ttl: PUBLIC_SCAN_TTL_MS,
            limit: PUBLIC_SCAN_LIMIT
          },
          {
            name: PUBLIC_POLL_THROTTLER,
            ttl: PUBLIC_POLL_TTL_MS,
            limit: PUBLIC_POLL_LIMIT
          }
        ],
        storage: new ThrottlerStorageRedisService(
          config.getOrThrow<string>("REDIS_URL")
        )
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
    SerpApiLensModule,
    NotificationsModule,
    VisualSearchModule,
    TurnstileModule,
    PublicScanModule
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
