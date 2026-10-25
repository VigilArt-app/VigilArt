import { Module } from "@nestjs/common";
import { DmcaNoticeController } from "./notice.controller";
import { DmcaNoticeService } from "./notice.service";
import { DmcaNoticeRetentionService } from "./notice-retention.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { StorageModule } from "../../storage/storage.module";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [DmcaNoticeController],
    providers: [DmcaNoticeService, DmcaNoticeRetentionService],
})
export class DmcaNoticeModule {}
