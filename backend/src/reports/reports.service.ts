import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { InjectQueue } from "@nestjs/bullmq";
import { Job, JobsOptions, Queue } from "bullmq";
import { VisionService } from "../vision/vision.service";
import {
  ArtworksReport,
  Artwork,
  ArtworksReportGet,
  ArtworksReportStatistics,
  ArtworksReportGlobalStatistics,
  CategoryDistributionItem,
  StatisticsTimelinePoint,
  StatisticsRange,
  WebsiteCategory,
  MatchingPage,
  MatchingPageGet,
  ApiBatchPayload,
  MATCHING_PAGE_CREATE_BATCH_MAX_SIZE,
  MatchingPageCreateMany,
  ScanEnqueued,
  ScanStatus,
  ScanProgress,
  ScanJobState
} from "@vigilart/shared";
import { Prisma } from "@vigilart/shared/server";
import { ArtworksService } from "../artworks/artworks.service";
import { StorageService } from "../storage/storage.service";
import { PrismaService } from "../prisma/prisma.service";
import { MatchingPagesService } from "./matchingPage.service";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { assertResourceOwnership } from "../common/utils/ownership";
import { normalizeMatchUrl } from "../common/utils/website-class";
import {
  MAX_SCANS_PER_WINDOW,
  SCAN_WINDOW_DAYS,
  REPORTS_QUEUE,
  GENERATE_REPORT_JOB
} from "./reports.constants";

const REPORTS_STATS_TTL = 30 * 24 * 60 * 60 * 1000;
const STATS_MONTH_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// Cap the statistics drill-down lists (per-category and per-report): a slice can
// accumulate thousands of matches, and the modal renders every row (with an
// image), so an unbounded query would ship a huge payload and jank the UI. The
// chart still shows the true total; the modal shows the most recent slice of it.
export const MATCHES_MODAL_LIMIT = 100;

// Cap the number of bars in the timeline chart: one bar per report, so a heavy
// user would otherwise get hundreds of unreadably-thin bars. Show the most
// recent scans (chronological order preserved for display).
export const TIMELINE_MAX_POINTS = 30;

// Only the time-invariant "all" range is cached; the rolling "month" window and
// report-scoped queries are recomputed every call so they never go stale. The
// `v2` marker invalidates pre-existing `{ totalMatches }`-only cache entries.
const REPORT_STATS_KEY = (userId: string, range: StatisticsRange = "all") => {
  return `reports:statistics:v2:${userId}:${range}`;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly visionService: VisionService,
    private readonly googleLensService: GoogleLensService,
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService,
    private readonly matchingPagesService: MatchingPagesService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectQueue(REPORTS_QUEUE) private readonly reportsQueue: Queue
  ) {}

  private readonly logger = new Logger(ReportsService.name);

  async aggregateVisualSearchResults(
    imageDownloadUrl: string
  ): Promise<MatchingPageGet[]> {
    const settledResults = await Promise.allSettled([
      this.googleLensService.searchImage(imageDownloadUrl)
    ]);
    const providers = ["googleLens"] as const;
    const matchingPages: MatchingPageGet[] = [];
    settledResults.forEach((result, index) => {
      if (result.status === "rejected") {
        this.logger.error(
          `Visual search provider "${providers[index]}" failed`,
          result.reason
        );
        return;
      }
      if (result.value) {
        matchingPages.push(...result.value.matchingPages);
      }
    });
    if (settledResults.every((result) => result.status === "rejected")) {
      throw new ServiceUnavailableException(
        "Visual search providers are currently unavailable. Please try again later."
      );
    }
    return matchingPages;
  }

  async findArtworkMatches(artwork: Artwork): Promise<MatchingPageCreateMany> {
    const imageDownloadUrl = await this.storageService.getDownloadUrl(
      artwork.storageKey
    );
    const matchingPages = await this.aggregateVisualSearchResults(
      imageDownloadUrl
    );
    const matchingPagesData = matchingPages.map((match) => ({
      artworkId: artwork.id,
      ...match,
      // Dedup on the canonical page URL: drop query string + fragment so
      // `.../123?lang=es` and `.../123` collapse to one MatchingPage row.
      url: normalizeMatchUrl(match.url)
    }));

    return matchingPagesData;
  }

  // Progress reporting is best-effort: a transient Redis failure here must
  // never reject and discard an otherwise-successful (already paid-for) scan.
  private emitProgress(job: Job | undefined, processed: number, total: number) {
    void job?.updateProgress({ processed, total }).catch(() => undefined);
  }

  async findArtworksMatches(userId: string, job?: Job): Promise<string[]> {
    const artworks = await this.artworksService.findAllPerUser(userId);
    const total = artworks.length;
    let processed = 0;
    this.emitProgress(job, processed, total);

    // Isolate per-artwork failures: one artwork's provider error (e.g. a Lens
    // timeout) must not discard the matches already found for the others.
    const settled = await Promise.allSettled(
      artworks.map((artwork) =>
        this.findArtworkMatches(artwork).finally(() => {
          processed += 1;
          this.emitProgress(job, processed, total);
        })
      )
    );
    const matchingPagesData = settled.flatMap((result, index) => {
      if (result.status === "rejected") {
        this.logger.error(
          `Scan failed for artwork ${artworks[index].id}`,
          result.reason
        );
        return [];
      }
      return result.value;
    });

    // If EVERY artwork failed, the scan never actually ran — fail the job so
    // the user sees an error, instead of saving a misleading "0 detections".
    if (
      artworks.length > 0 &&
      settled.every((result) => result.status === "rejected")
    ) {
      throw new ServiceUnavailableException(
        "Scan failed: the visual search provider did not respond in time. Please try again."
      );
    }

    const foundMatchesIds: string[] = [];
    for (
      let i = 0;
      i < matchingPagesData.length;
      i += MATCHING_PAGE_CREATE_BATCH_MAX_SIZE
    ) {
      const res = await this.matchingPagesService.createMany(
        matchingPagesData.slice(i, i + MATCHING_PAGE_CREATE_BATCH_MAX_SIZE)
      );
      foundMatchesIds.push(...res.matchingPages.map((m) => m.id));
    }
    return foundMatchesIds;
  }

  async checkScanQuota(userId: string) {
    const windowStart = new Date(
      Date.now() - SCAN_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    const scansInWindow = await this.prisma.artworksReport.count({
      where: {
        userId,
        detectionDate: {
          gt: windowStart
        }
      }
    });

    if (scansInWindow >= MAX_SCANS_PER_WINDOW)
      throw new ForbiddenException(
        `You have reached the maximum of ${MAX_SCANS_PER_WINDOW} scans per ${SCAN_WINDOW_DAYS} days. Please wait before generating a new report.`
      );
  }

  async generate(userId: string, job?: Job): Promise<ArtworksReport> {
    await this.checkScanQuota(userId);
    this.logger.log(`Generate new report for user ${userId}`);

    const matchingPagesIds = await this.findArtworksMatches(userId, job);
    const report = await this.prisma.artworksReport.create({
      data: {
        userId,
        matchingPages: {
          connect: matchingPagesIds.map((id) => ({ id }))
        }
      }
    });

    await this.prisma.artwork.updateMany({
      where: { userId },
      data: { lastScanAt: new Date() }
    });
    await this.cacheManager.del(REPORT_STATS_KEY(userId));
    return report;
  }

  private scanJobId(userId: string): string {
    return `scan-${userId}`;
  }

  private isRunningState(state: string): boolean {
    return (
      state === "active" ||
      state === "waiting" ||
      state === "waiting-children" ||
      state === "prioritized" ||
      state === "delayed"
    );
  }

  private mapJobState(state: string): ScanJobState {
    switch (state) {
      case "active":
      case "completed":
      case "failed":
      case "delayed":
        return state;
      default:
        return "waiting";
    }
  }

  // Single-flight enqueue against the deterministic per-user job id. Any
  // source (manual button, hourly scheduler) that targets the same user
  // collapses onto the same job: a scan already in flight is reused, and a
  // retained terminal job is cleared so a fresh scan can take its id. A
  // crashed/stalled active job is left to BullMQ's own stalled-job recovery
  // rather than being force-removed here.
  private async enqueueScanJob(
    userId: string,
    options: JobsOptions
  ): Promise<string> {
    const jobId = this.scanJobId(userId);
    const existing = await this.reportsQueue.getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (this.isRunningState(state)) {
        return jobId;
      }
      // Terminal (completed/failed) job retained only so the status endpoint
      // could read its result; clear it so the id can be reused.
      await existing.remove().catch(() => undefined);
    }

    const job = await this.reportsQueue.add(
      GENERATE_REPORT_JOB,
      { userId },
      { jobId, ...options }
    );
    return job.id ?? jobId;
  }

  // Enqueue an interactive async scan (fail fast, retain the finished job so
  // the frontend can poll its result). Quota is checked up front for
  // immediate feedback before a job is created.
  async enqueueScan(userId: string): Promise<ScanEnqueued> {
    await this.checkScanQuota(userId);
    const jobId = await this.enqueueScanJob(userId, {
      attempts: 1,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 86400 }
    });
    return { jobId };
  }

  // Enqueue an auto-scan from the scheduler: retry-friendly and self-cleaning.
  // Shares the deterministic id with manual scans so a user is never scanned
  // twice concurrently. Quota is enforced later inside generate().
  async enqueueScheduledScan(userId: string): Promise<void> {
    await this.enqueueScanJob(userId, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: 100
    });
  }

  async getScanStatus(userId: string, jobId: string): Promise<ScanStatus> {
    const job = await this.reportsQueue.getJob(jobId);
    if (!job || job.data?.userId !== userId)
      throw new NotFoundException("Scan job not found.");

    const state = await job.getState();
    // The job was evicted between getJob and getState; treat it as gone so the
    // client fails fast instead of polling a phantom "waiting" job.
    if (state === "unknown") throw new NotFoundException("Scan job not found.");
    const progress =
      job.progress && typeof job.progress === "object"
        ? (job.progress as ScanProgress)
        : null;

    return {
      jobId,
      state: this.mapJobState(state),
      progress,
      reportId:
        state === "completed" && typeof job.returnvalue === "string"
          ? job.returnvalue
          : null,
      error: state === "failed" ? job.failedReason ?? "Scan failed." : null
    };
  }

  async findMatchesByArtwork(
    artworkId: string,
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding matches of artwork ${artworkId}`);

    // Enforces ownership: throws ForbiddenException if the artwork isn't the user's.
    await this.artworksService.findOne(userId, artworkId);

    let report: ArtworksReportGet;
    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      report = await this.findOne(userId, reportId);
    } else {
      this.logger.log("Retrieving latest report");
      report = await this.findLatestReport(userId);
    }
    return report.matchingPages.filter((p) => p.artworkId === artworkId);
  }

  async findAll(): Promise<ArtworksReport[]> {
    this.logger.log("Finding all reports");
    return this.prisma.artworksReport.findMany();
  }

  async findAllPerUser(userId: string): Promise<ArtworksReport[]> {
    this.logger.log(`Finding all reports for user ${userId}`);
    return this.prisma.artworksReport.findMany({
      where: {
        userId
      }
    });
  }

  async findOne(userId: string, id: string): Promise<ArtworksReportGet> {
    this.logger.log(`Finding report ${id}`);
    const report = await this.prisma.artworksReport.findUniqueOrThrow({
      where: {
        id
      },
      include: { matchingPages: true }
    });

    return assertResourceOwnership(report, userId);
  }

  async findLatestReport(userId: string): Promise<ArtworksReportGet> {
    this.logger.log(`Finding latest report for user ${userId}`);
    const report = await this.prisma.artworksReport.findFirstOrThrow({
      where: {
        userId
      },
      orderBy: {
        detectionDate: "desc"
      },
      include: { matchingPages: true }
    });
    return assertResourceOwnership(report, userId);
  }

  async findMatchesByUser(
    userId: string,
    reportId?: string
  ): Promise<MatchingPage[]> {
    let selectedReport: ArtworksReportGet;

    this.logger.log(`Finding matches for user ${userId}`);
    if (reportId) {
      this.logger.log(`Retrieving report ${reportId}`);
      selectedReport = await this.findOne(userId, reportId);
    } else {
      this.logger.log("Retrieving latest report");
      selectedReport = await this.findLatestReport(userId);
    }
    return selectedReport.matchingPages;
  }

  async getGlobalStatistics(
    userId: string,
    reportId?: string,
    range: StatisticsRange = "all"
  ): Promise<ArtworksReportGlobalStatistics> {
    // Only the unscoped "all time" view is time-invariant, so it is the only
    // cacheable path. "month" is a rolling window and a specific report is niche.
    const cacheable = !reportId && range === "all";

    if (cacheable) {
      const cached = await this.cacheManager.get<ArtworksReportGlobalStatistics>(
        REPORT_STATS_KEY(userId, range)
      );
      if (cached)
        return cached;
    }

    const [categoryDistribution, timeline] = await Promise.all([
      this.getCategoryDistribution(userId, reportId, range),
      this.getReportsTimeline(userId)
    ]);
    const totalMatches = categoryDistribution.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const result: ArtworksReportGlobalStatistics = {
      totalMatches,
      categoryDistribution,
      timeline
    };

    if (cacheable) {
      await this.cacheManager.set(
        REPORT_STATS_KEY(userId, range),
        result,
        REPORTS_STATS_TTL
      );
    }

    return result;
  }

  // The report-scope filter shared by the category distribution and the
  // per-category match list, so a slice's count and its drill-down list always
  // agree: a specific report when `reportId` is set, otherwise all of the
  // user's reports (optionally limited to the rolling month window).
  private buildReportFilter(
    userId: string,
    reportId?: string,
    range: StatisticsRange = "all"
  ): Prisma.ArtworksReportWhereInput {
    return reportId
      ? { id: reportId, userId }
      : {
          userId,
          ...(range === "month"
            ? {
                detectionDate: {
                  gt: new Date(Date.now() - STATS_MONTH_WINDOW_MS)
                }
              }
            : {})
        };
  }

  // Distribution of distinct matching pages per website category. The many-to-many
  // `some` filter counts each page once even if it appears in several reports.
  private async getCategoryDistribution(
    userId: string,
    reportId?: string,
    range: StatisticsRange = "all"
  ): Promise<CategoryDistributionItem[]> {
    const grouped = await this.prisma.matchingPage.groupBy({
      by: ["category"],
      where: { reports: { some: this.buildReportFilter(userId, reportId, range) } },
      _count: { _all: true }
    });

    return grouped.map((group) => ({
      category: group.category,
      count: group._count._all
    }));
  }

  // Drill-down list backing a clicked pie slice: the distinct matching pages in
  // one category, scoped by the same filter as getCategoryDistribution so the
  // list length matches the slice count. Newest detections first.
  async findMatchesByCategory(
    userId: string,
    category: WebsiteCategory,
    range: StatisticsRange = "all"
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding ${category} matches for user ${userId}`);
    return this.prisma.matchingPage.findMany({
      where: {
        category,
        reports: { some: this.buildReportFilter(userId, undefined, range) }
      },
      orderBy: { firstDetectedAt: "desc" },
      take: MATCHES_MODAL_LIMIT
    });
  }

  // Drill-down list backing a clicked Monthly-comparison bar: the matches found
  // in one report, newest first and capped. Ownership/existence are checked with
  // a light userId-only lookup (403/404) before the capped list query, so we
  // never materialize a huge report's full match set just to slice it.
  async findMatchesByReport(
    userId: string,
    reportId: string
  ): Promise<MatchingPage[]> {
    this.logger.log(`Finding matches of report ${reportId} for user ${userId}`);
    const report = await this.prisma.artworksReport.findUniqueOrThrow({
      where: { id: reportId },
      select: { userId: true }
    });
    assertResourceOwnership(report, userId);

    return this.prisma.matchingPage.findMany({
      where: { reports: { some: this.buildReportFilter(userId, reportId) } },
      orderBy: { firstDetectedAt: "desc" },
      take: MATCHES_MODAL_LIMIT
    });
  }

  // Per-report repost counts for the monthly comparison bar chart. Always spans
  // every report of the user (independent of the pie's All Time / Last Month
  // range) — a time-trend chart scoped to one month would collapse to a few bars.
  private async getReportsTimeline(
    userId: string
  ): Promise<StatisticsTimelinePoint[]> {
    // Take the most recent N (desc + take), then restore ascending order so the
    // chart still reads left-to-right oldest→newest.
    const reports = await this.prisma.artworksReport.findMany({
      where: { userId },
      orderBy: { detectionDate: "desc" },
      take: TIMELINE_MAX_POINTS,
      select: {
        id: true,
        detectionDate: true,
        _count: { select: { matchingPages: true } }
      }
    });

    return reports.reverse().map((report) => ({
      reportId: report.id,
      date: report.detectionDate.toISOString(),
      totalMatches: report._count.matchingPages
    }));
  }

  async getArtworkStatistics(
    artworkId: string,
    userId: string,
    reportId?: string
  ): Promise<ArtworksReportStatistics> {
    const matchingPages = await this.findMatchesByArtwork(
      artworkId,
      userId,
      reportId
    );

    return {
      totalMatches: matchingPages.length
    };
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing artworks report ${id}`);
    // Capture the owner before deletion so the cached "all time" statistics
    // (which counted this report's matches) don't outlive it.
    const report = await this.prisma.artworksReport.findUnique({
      where: { id },
      select: { userId: true }
    });
    await this.prisma.artworksReport.delete({
      where: {
        id
      }
    });
    if (report) await this.cacheManager.del(REPORT_STATS_KEY(report.userId));
  }

  async removeMany(ids: string[]): Promise<ApiBatchPayload> {
    this.logger.log(`Removing artworks reports ${ids.join(",")}`);
    const reports = await this.prisma.artworksReport.findMany({
      where: { id: { in: ids } },
      select: { userId: true },
      distinct: ["userId"]
    });
    const result = await this.prisma.artworksReport.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    await Promise.all(
      reports.map((report) =>
        this.cacheManager.del(REPORT_STATS_KEY(report.userId))
      )
    );
    return result;
  }
}
