import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ArtworkLimitService } from "./artwork-limit.service";

@Module({ imports: [PrismaModule], providers: [ArtworkLimitService], exports: [ArtworkLimitService] })
export class ArtworkLimitModule {}
