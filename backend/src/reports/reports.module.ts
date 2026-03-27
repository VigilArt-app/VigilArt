import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { VisionModule } from "../vision/vision.module";
import { ArtworksModule } from "../artworks/artworks.module";
import { StorageModule } from "../storage/storage.module";
import { MatchingPagesService } from "./matchingPage.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, VisionModule, ArtworksModule, StorageModule],
  controllers: [ReportsController],
  providers: [ReportsService, MatchingPagesService]
})
export class ReportsModule {}
