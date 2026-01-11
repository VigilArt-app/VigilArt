import { Module } from "@nestjs/common";
import { VisionService } from "./vision.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [VisionService],
  exports: [VisionService],
})
export class VisionModule {}
