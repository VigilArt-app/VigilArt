import { Module } from "@nestjs/common";
import { DmcaNoticeController } from "./notice.controller";
import { DmcaNoticeService } from "./notice.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [DmcaNoticeController],
    providers: [DmcaNoticeService],
})
export class DmcaNoticeModule {}
