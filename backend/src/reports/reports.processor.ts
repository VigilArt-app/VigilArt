import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ReportsService } from "./reports.service";
import { REPORTS_QUEUE, GENERATE_REPORT_JOB } from "./reports.constants";

export interface GenerateReportJobData {
  userId: string;
}

@Processor(REPORTS_QUEUE)
export class ReportsProcessor extends WorkerHost {
  constructor(private readonly reportsService: ReportsService) {
    super();
  }

  async process(job: Job<GenerateReportJobData>): Promise<void> {
    if (job.name === GENERATE_REPORT_JOB)
      await this.reportsService.generate(job.data.userId);
  }
}
