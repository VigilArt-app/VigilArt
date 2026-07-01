import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { REPORTS_QUEUE, GENERATE_REPORT_JOB } from "./reports.constants";
import type { GenerateReportJobData } from "./reports.processor";

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(
    @InjectQueue(REPORTS_QUEUE) private readonly reportsQueue: Queue,
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
      users.map((user) => {
        const jobData: GenerateReportJobData = { userId: user.id };

        return this.reportsQueue.add(GENERATE_REPORT_JOB, jobData, {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: 100
        });
      })
    );
    this.logger.log(`Successfully enqueued ${users.length} auto-report job(s).`);
  }
}
