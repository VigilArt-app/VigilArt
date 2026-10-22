import { Module } from "@nestjs/common";
import { SerpApiLensService } from "./serpapilens.service";
import { SerpApiAccountService } from "./serpapi-account.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SerpApiLensService, SerpApiAccountService],
  exports: [SerpApiLensService, SerpApiAccountService]
})
export class SerpApiLensModule {}
