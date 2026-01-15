import { Module } from "@nestjs/common";
import { DmcaProfileController } from "./profile.controller";
import { DmcaProfileService } from "./profile.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [DmcaProfileController],
    providers: [DmcaProfileService],
})
export class DmcaProfileModule {}
