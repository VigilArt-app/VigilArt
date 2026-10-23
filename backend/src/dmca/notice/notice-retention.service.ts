import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";

export const NOTICE_RETENTION_CRON = "dmca-notice-retention";
export const NOTICE_RETENTION_YEARS = 3;

// Notices outlive account deletion for legal reasons (a platform may ask for
// them), but the Privacy Policy promises they are deleted 3 years after they
// were created. Notices of live accounts are kept while the account exists.
@Injectable()
export class DmcaNoticeRetentionService {
  private readonly logger = new Logger(DmcaNoticeRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: NOTICE_RETENTION_CRON })
  async deleteExpiredOrphanedNotices(): Promise<number> {
    const cutoff = new Date();
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - NOTICE_RETENTION_YEARS);

    try {
      const { count } = await this.prisma.dmcaNotice.deleteMany({
        where: { userId: null, createdAt: { lt: cutoff } }
      });
      this.logger.log(`Deleted ${count} DMCA notices kept past ${NOTICE_RETENTION_YEARS} years`);
      return count;
    } catch (error) {
      this.logger.error("Failed to delete expired DMCA notices", error);
      return 0;
    }
  }
}
