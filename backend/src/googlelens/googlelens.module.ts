import { Module } from "@nestjs/common";
import { GoogleLensService } from "./googlelens.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [GoogleLensService],
  exports: [GoogleLensService]
})
export class GoogleLensModule {}
