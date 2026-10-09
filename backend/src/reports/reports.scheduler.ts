import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { FREE_ARTWORK_LIMIT, SubscriptionTier } from "@vigilart/shared";
import { PrismaService } from "../prisma/prisma.service";
import { ReportsService } from "./reports.service";
import { SCAN_WINDOW_DAYS } from "./reports.constants";

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleAutoReports(): Promise<void> {
    const windowStart = new Date(Date.now() - SCAN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    // A refused or failed scan saves no report, so any scan attempt in the window
    // (ScanUsage) also blocks re-enqueue; accounts that would be refused are skipped.
    const candidates = await this.prisma.user.findMany({
      where: {
        autoRunReports: true,
        artworks: { some: {} },
        scanUsages: { none: { startedAt: { gt: windowStart } } },
        artworksReport: { none: { detectionDate: { gt: windowStart } } }
      },
      select: { id: true, subscriptionTier: true, _count: { select: { artworks: true } } }
    });
    const users = candidates.filter((user) =>
      user.subscriptionTier !== SubscriptionTier.FREE || user._count.artworks <= FREE_ARTWORK_LIMIT
    );

    if (users.length === 0)
      return;
    await Promise.all(
      users.map((user) => this.reportsService.enqueueScheduledScan(user.id))
    );
    this.logger.log(`Successfully enqueued ${users.length} auto-report job(s).`);
  }
}
