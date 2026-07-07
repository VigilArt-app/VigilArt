import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ReportsService } from "./reports.service";
import { NotificationsService } from "../notifications/notifications.service";
import { REPORTS_QUEUE, GENERATE_REPORT_JOB } from "./reports.constants";
import type { NotificationPayload } from "@vigilart/shared";

export interface GenerateReportJobData {
  userId: string;
}

@Processor(REPORTS_QUEUE)
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly notificationsService: NotificationsService
  ) {
    super();
  }

  async process(job: Job<GenerateReportJobData>): Promise<string | void> {
    if (job.name === GENERATE_REPORT_JOB) {
      const report = await this.reportsService.generate(job.data.userId, job);

      const notification: NotificationPayload = {
        type: "REPORT_COMPLETED",
        title: "Report Ready",
        body: "Your artwork scan report has been generated and is ready to view.",
        data: { reportId: report.id }
      };

      try {
        await this.notificationsService
          .send(job.data.userId, notification)
      } catch (err) {
        this.logger.error("Failed to send report notification", err);
      }
      return report.id;
    }
  }
}
