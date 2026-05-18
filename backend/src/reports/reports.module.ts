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
  providers: [ReportsService, MatchingPagesService, ReportsProcessor, ReportsScheduler]
})
export class ReportsModule {}
