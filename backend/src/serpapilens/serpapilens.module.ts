import { Module } from "@nestjs/common";
import { SerpApiLensService } from "./serpapilens.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SerpApiLensService],
  exports: [SerpApiLensService]
})
export class SerpApiLensModule {}
