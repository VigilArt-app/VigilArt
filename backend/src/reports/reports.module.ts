import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { VisionModule } from "../vision/vision.module";
import { ArtworksModule } from "../artworks/artworks.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [VisionModule, ArtworksModule, StorageModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
