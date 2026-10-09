import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { TurnstileService } from "./turnstile.service";

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [TurnstileService],
  exports: [TurnstileService]
})
export class TurnstileModule {}
