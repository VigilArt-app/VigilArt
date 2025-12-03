import { Module } from "@nestjs/common";
import { ArtworksController } from "./artworks.controller";
import { ArtworksService } from "./artworks.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  imports: [PrismaModule],
  controllers: [ArtworksController],
  providers: [ArtworksService, PrismaService],
})
export class ArtworksModule {}
