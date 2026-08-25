import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import {
  MatchingPageGet,
  PublicScanResult,
  PublicScanCategoryCount,
  PUBLIC_SCAN_PREVIEW_MATCHES,
  WebsiteCategory
} from "@vigilart/shared";
import { VisualSearchService } from "../visualsearch/visual-search.service";
import { StorageService } from "../storage/storage.service";
import { normalizeMatchUrl } from "../common/utils/website-class";
import type { PublicScanJobData } from "./public-scan.service";
import {
  PUBLIC_SCAN_QUEUE,
  PUBLIC_SCAN_JOB,
  PUBLIC_SCAN_CONCURRENCY
} from "./public-scan.constants";

@Processor(PUBLIC_SCAN_QUEUE, { concurrency: PUBLIC_SCAN_CONCURRENCY })
export class PublicScanProcessor extends WorkerHost {
  private readonly logger = new Logger(PublicScanProcessor.name);

  constructor(
    private readonly visualSearchService: VisualSearchService,
    private readonly storageService: StorageService
  ) {
    super();
  }

  async process(job: Job<PublicScanJobData>): Promise<PublicScanResult | void> {
    if (job.name !== PUBLIC_SCAN_JOB) return;

    const { storageKey } = job.data;
    try {
      const downloadUrl = await this.storageService.getDownloadUrl(storageKey);
      const matches = await this.visualSearchService.aggregate(downloadUrl);
      return this.summarize(matches);
    } finally {
      // The visitor was told their artwork is deleted after the scan, so this
      // runs on the failure path too. A bucket lifecycle rule covers the case
      // where the worker dies before reaching this line — see
      // documentation/public-scan-retention.md.
      await this.storageService.deleteImage(storageKey).catch((error) => {
        this.logger.error(
          `Failed to delete public scan image ${storageKey}`,
          error
        );
      });
    }
  }

  // Counts run on the whole result; only the preview slice is returned, so the
  // hidden matches are never stored in Redis or shipped to the browser.
  private summarize(matches: MatchingPageGet[]): PublicScanResult {
    const byUrl = new Map<string, MatchingPageGet>();
    for (const match of matches) {
      const url = normalizeMatchUrl(match.url);
      if (!byUrl.has(url)) byUrl.set(url, { ...match, url });
    }
    const unique = [...byUrl.values()];

    const counts = new Map<WebsiteCategory, number>();
    for (const match of unique) {
      counts.set(match.category, (counts.get(match.category) ?? 0) + 1);
    }
    const categories: PublicScanCategoryCount[] = [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalMatches: unique.length,
      matches: unique.slice(0, PUBLIC_SCAN_PREVIEW_MATCHES),
      categories
    };
  }
}
