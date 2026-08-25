import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StorageModule } from "../storage/storage.module";
import { VisualSearchModule } from "../visualsearch/visualsearch.module";
import { TurnstileModule } from "../turnstile/turnstile.module";
import { PublicScanController } from "./public-scan.controller";
import { PublicScanService } from "./public-scan.service";
import { PublicScanProcessor } from "./public-scan.processor";
import { PublicScanBudgetService } from "./public-scan-budget.service";
import { PublicScanBudgetGuard } from "./public-scan-budget.guard";
import { PublicScanReservationInterceptor } from "./public-scan-reservation.interceptor";
import { publicScanRedisProvider } from "./public-scan.redis";
import { PUBLIC_SCAN_QUEUE } from "./public-scan.constants";

@Module({
  imports: [
    StorageModule,
    VisualSearchModule,
    TurnstileModule,
    BullModule.registerQueueAsync({
      name: PUBLIC_SCAN_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>("REDIS_URL")
        }
      })
    })
  ],
  controllers: [PublicScanController],
  providers: [
    publicScanRedisProvider,
    PublicScanService,
    PublicScanProcessor,
    PublicScanBudgetService,
    PublicScanBudgetGuard,
    PublicScanReservationInterceptor
  ]
})
export class PublicScanModule {}
