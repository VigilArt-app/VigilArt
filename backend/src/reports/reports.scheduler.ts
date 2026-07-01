import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { ReportsService } from "./reports.service";

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleAutoReports(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const users = await this.prisma.user.findMany({
      where: {
        autoRunReports: true,
        OR: [
          { artworksReport: { none: {} } },
          {
            artworksReport: {
              none: {
                detectionDate: { gt: thirtyDaysAgo }
              }
            }
          }
        ]
      },
      select: { id: true }
    });

    if (users.length === 0)
      return;
    await Promise.all(
      users.map((user) => this.reportsService.enqueueScheduledScan(user.id))
    );
    this.logger.log(`Successfully enqueued ${users.length} auto-report job(s).`);
  }
}
