import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  PublicScanAllowance,
  PublicScanEnqueued,
  PublicScanResult,
  PublicScanState,
  PublicScanStatus
} from "@vigilart/shared";
import { StorageService } from "../../storage/storage.service";
import {
  sniffImageType,
  extensionForImageType
} from "../../common/utils/image-magic-bytes";
import { PublicScanBudgetService } from "./public-scan-budget.service";
import {
  PUBLIC_SCAN_QUEUE,
  PUBLIC_SCAN_JOB,
  PUBLIC_SCAN_MAX_FILE_BYTES,
  PUBLIC_SCAN_RESULT_TTL_SECONDS,
  PUBLIC_SCAN_STORAGE_PREFIX
} from "../public-scan.constants";

export interface PublicScanJobData {
  storageKey: string;
}

@Injectable()
export class PublicScanService {
  constructor(
    private readonly storageService: StorageService,
    private readonly budgetService: PublicScanBudgetService,
    @InjectQueue(PUBLIC_SCAN_QUEUE) private readonly queue: Queue
  ) {}

  private readonly logger = new Logger(PublicScanService.name);

  // The caller is holding a budget reservation taken by PublicScanBudgetGuard.
  // Handing it back on the failure paths is PublicScanReservationInterceptor's
  // job, because some of them (an over-sized upload) never reach this method.
  async start(file?: Express.Multer.File): Promise<PublicScanEnqueued> {
    if (!file?.buffer?.length) {
      throw new BadRequestException("No image was uploaded.");
    }
    if (file.size > PUBLIC_SCAN_MAX_FILE_BYTES) {
      throw new PayloadTooLargeException("Images must be 5 MB or smaller.");
    }

    const contentType = sniffImageType(file.buffer);
    if (!contentType) {
      throw new BadRequestException("Only JPEG and PNG images are supported.");
    }

    // The key is generated here, never taken from the upload's filename: a
    // caller-supplied name could contain path segments and write outside the
    // prefix. The prefix is also absent from StoragePrefixEnum on purpose, so
    // the authenticated upload-URL route cannot mint write access to it.
    const storageKey = `${PUBLIC_SCAN_STORAGE_PREFIX}/${crypto.randomUUID()}${extensionForImageType(contentType)}`;

    await this.storageService.uploadBuffer(
      file.buffer,
      storageKey,
      contentType,
      1
    );

    // An explicit random id. Left to BullMQ the id is a counter ("1", "2", ...)
    // and the status route has no owner to check against, so a visitor could
    // read someone else's result by guessing the next number.
    const scanId = crypto.randomUUID();

    try {
      const job = await this.queue.add(
        PUBLIC_SCAN_JOB,
        { storageKey } satisfies PublicScanJobData,
        {
          jobId: scanId,
          attempts: 1,
          removeOnComplete: { age: PUBLIC_SCAN_RESULT_TTL_SECONDS },
          removeOnFail: { age: PUBLIC_SCAN_RESULT_TTL_SECONDS }
        }
      );
      return { scanId: job.id ?? scanId };
    } catch (error) {
      // The image is already in the bucket but nothing will ever scan it.
      this.logger.error(`Failed to queue public scan ${scanId}`, error);
      await this.storageService.deleteImage(storageKey).catch(() => undefined);
      throw error;
    }
  }

  async getStatus(scanId: string): Promise<PublicScanStatus> {
    const job = await this.queue.getJob(scanId);
    if (!job) throw new NotFoundException("Scan not found or expired.");

    const state = await job.getState();
    if (state === "unknown") {
      throw new NotFoundException("Scan not found or expired.");
    }

    return {
      scanId,
      state: this.mapState(state),
      // The worker already truncated the match list before returning it, so the
      // full result never reaches Redis, let alone the response.
      result:
        state === "completed"
          ? ((job.returnvalue as PublicScanResult | undefined) ?? null)
          : null,
      error:
        state === "failed"
          ? (job.failedReason ?? "The scan could not be completed.")
          : null
    };
  }

  private mapState(state: string): PublicScanState {
    switch (state) {
      case "active":
        return "running";
      case "completed":
        return "done";
      case "failed":
        return "failed";
      default:
        return "pending";
    }
  }

  async getAllowance(): Promise<PublicScanAllowance> {
    return { remainingToday: await this.budgetService.remainingToday() };
  }
}
