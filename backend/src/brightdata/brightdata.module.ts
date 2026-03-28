import { Module } from "@nestjs/common";
import { BrightDataService } from "./brightdata.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [BrightDataService],
  exports: [BrightDataService]
})
export class BrightDataModule {}
