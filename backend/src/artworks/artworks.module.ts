import { Module } from "@nestjs/common";
import { ArtworksController } from "./artworks.controller";
import { ArtworksService } from "./artworks.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ArtworksController],
  providers: [ArtworksService, PrismaService],
  exports: [ArtworksService],
})
export class ArtworksModule {}
