import { Module } from "@nestjs/common";
import { DmcaNoticeController } from "./notice.controller";
import { DmcaNoticeService } from "./notice.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { StorageModule } from "../../storage/storage.module";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [DmcaNoticeController],
    providers: [DmcaNoticeService],
})
export class DmcaNoticeModule {}
