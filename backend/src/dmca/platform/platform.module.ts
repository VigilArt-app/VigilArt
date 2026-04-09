import { Module } from "@nestjs/common";
import { DmcaPlatformController } from "./platform.controller";
import { DmcaPlatformService } from "./platform.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [DmcaPlatformController],
    providers: [DmcaPlatformService],
})
export class DmcaPlatformModule {}
