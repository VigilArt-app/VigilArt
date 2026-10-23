import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StorageController } from "./storage.controller";
import { ArtworkLimitModule } from "../artworks/artwork-limit.module";

@Module({
  imports: [ArtworkLimitModule],
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService]
})
export class StorageModule {}
