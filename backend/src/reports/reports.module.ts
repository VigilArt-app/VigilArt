import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { VisionModule } from "../vision/vision.module";
import { ArtworksModule } from "../artworks/artworks.module";
import { StorageModule } from "../storage/storage.module";
import { MatchingPagesService } from "./matchingPage.service";
import { PrismaModule } from "../prisma/prisma.module";
import { GoogleLensModule } from "../googlelens/googlelens.module";
import { ReportsProcessor } from "./reports.processor";
import { ReportsScheduler } from "./reports.scheduler";
import { REPORTS_QUEUE } from "./reports.constants";

// The scan worker (BullMQ processor) runs heavy per-artwork image + provider
// work. When APP_ROLE=api this process only serves HTTP and enqueues jobs; the
// worker + scheduler run in a separate forked process (see main.ts) so a scan
// crash/OOM can never take the API down. With APP_ROLE unset the worker stays
// in-process (unchanged single-process behavior for local dev and tests).
const runsScanWorker = process.env.APP_ROLE !== "api";

@Module({
  imports: [
    PrismaModule,
    VisionModule,
    ArtworksModule,
    StorageModule,
    GoogleLensModule,
    BullModule.registerQueueAsync({
      name: REPORTS_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>("REDIS_URL")
        }
      })
    })
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    MatchingPagesService,
    ...(runsScanWorker ? [ReportsProcessor, ReportsScheduler] : [])
  ]
})
export class ReportsModule {}
