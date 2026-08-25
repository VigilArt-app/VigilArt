import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { ArtworksModule } from "../artworks/artworks.module";
import { StorageModule } from "../storage/storage.module";
import { MatchingPagesService } from "./matchingPage.service";
import { PrismaModule } from "../prisma/prisma.module";
import { VisualSearchModule } from "../visualsearch/visualsearch.module";
import { ReportsProcessor } from "./reports.processor";
import { ReportsScheduler } from "./reports.scheduler";
import { REPORTS_QUEUE } from "./reports.constants";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    PrismaModule,
    ArtworksModule,
    StorageModule,
    VisualSearchModule,
    NotificationsModule,
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
