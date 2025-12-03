import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { VisionModule } from "src/vision/vision.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [VisionModule, PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
