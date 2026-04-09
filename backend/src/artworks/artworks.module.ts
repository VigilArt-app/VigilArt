import { Module } from "@nestjs/common";
import { ArtworksController } from "./artworks.controller";
import { ArtworksService } from "./artworks.service";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ArtworksController],
  providers: [ArtworksService],
  exports: [ArtworksService]
})
export class ArtworksModule {}
