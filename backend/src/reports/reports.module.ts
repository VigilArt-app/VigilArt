import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { VisionModule } from "../vision/vision.module";
import { ArtworksModule } from "../artworks/artworks.module";

@Module({
  imports: [VisionModule, ArtworksModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
