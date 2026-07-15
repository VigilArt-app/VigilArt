import { Test, TestingModule } from "@nestjs/testing";
import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { getQueueToken } from "@nestjs/bullmq";
import {
  MATCHES_MODAL_LIMIT,
  ReportsService,
  TIMELINE_MAX_POINTS
} from "./reports.service";
import { VisionService } from "../vision/vision.service";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { SerpApiLensService } from "../serpapilens/serpapilens.service";
import { ArtworksService } from "../artworks/artworks.service";
import { StorageService } from "../storage/storage.service";
import { MatchingPagesService } from "./matchingPage.service";
import { PrismaService } from "../prisma/prisma.service";
import { MAX_SCANS_PER_WINDOW, REPORTS_QUEUE } from "./reports.constants";

describe("ReportsService", () => {
  let service: ReportsService;
  let visionService: { searchImage: jest.Mock };
  let serpApiLensService: { searchImage: jest.Mock };
  let artworksService: { findAllPerUser: jest.Mock };
  let storageService: { getImage: jest.Mock; getDownloadUrl: jest.Mock };
  let matchingPagesService: { createMany: jest.Mock };
  let prisma: {
    artworksReport: {
      count: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    artwork: { updateMany: jest.Mock };
    matchingPage: { groupBy: jest.Mock; findMany: jest.Mock };
  };
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let queue: { add: jest.Mock; getJob: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: VisionService, useValue: { searchImage: jest.fn() } },
        { provide: GoogleLensService, useValue: { searchImage: jest.fn() } },
        { provide: SerpApiLensService, useValue: { searchImage: jest.fn() } },
        { provide: ArtworksService, useValue: { findAllPerUser: jest.fn() } },
        {
          provide: StorageService,
          useValue: { getImage: jest.fn(), getDownloadUrl: jest.fn() }
        },
        { provide: MatchingPagesService, useValue: { createMany: jest.fn() } },
        {
          provide: PrismaService,
          useValue: {
            artworksReport: {
              count: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findUniqueOrThrow: jest.fn()
            },
            artwork: { updateMany: jest.fn() },
            matchingPage: { groupBy: jest.fn(), findMany: jest.fn() }
          }
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() }
        },
        {
          provide: getQueueToken(REPORTS_QUEUE),
          useValue: { add: jest.fn(), getJob: jest.fn() }
        }
      ]
    }).compile();

    service = module.get(ReportsService);
    visionService = module.get(VisionService);
    serpApiLensService = module.get(SerpApiLensService);
    artworksService = module.get(ArtworksService);
    storageService = module.get(StorageService);
    matchingPagesService = module.get(MatchingPagesService);
    prisma = module.get(PrismaService);
    cache = module.get(CACHE_MANAGER);
    queue = module.get(getQueueToken(REPORTS_QUEUE));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("aggregateVisualSearchResults", () => {
    it("Should return Google Lens matches", async () => {
      serpApiLensService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://b.example" }]
      });

      const res = await service.aggregateVisualSearchResults(
        "https://download.example"
      );

      expect(res).toEqual([{ url: "https://b.example" }]);
    });

    it("Should return the surviving provider's matches when one provider fails", async () => {
      visionService.searchImage.mockRejectedValue(new Error("vision down"));
      serpApiLensService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://b.example" }]
      });

      const res = await service.aggregateVisualSearchResults(
        // Buffer.from(""),
        "https://download.example"
      );

      expect(res).toEqual([{ url: "https://b.example" }]);
    });

    it("Should return an empty array for a genuine zero-match scan", async () => {
      visionService.searchImage.mockResolvedValue(null);
      serpApiLensService.searchImage.mockResolvedValue({ matchingPages: [] });

      const res = await service.aggregateVisualSearchResults(
        // Buffer.from(""),
        "https://download.example"
      );

      expect(res).toEqual([]);
    });

    it("Should throw when all providers fail", async () => {
      visionService.searchImage.mockRejectedValue(new Error("vision down"));
      serpApiLensService.searchImage.mockRejectedValue(new Error("lens down"));

      await expect(
        service.aggregateVisualSearchResults(
          // Buffer.from(""),
          "https://download.example"
        )
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe("checkScanQuota", () => {
    it(`Should allow a scan below the ${MAX_SCANS_PER_WINDOW}-scan limit`, async () => {
      prisma.artworksReport.count.mockResolvedValue(MAX_SCANS_PER_WINDOW - 1);

      await expect(
        service.checkScanQuota("user-id")
      ).resolves.toBeUndefined();
    });

    it(`Should throw once the ${MAX_SCANS_PER_WINDOW}-scan limit is reached`, async () => {
      prisma.artworksReport.count.mockResolvedValue(MAX_SCANS_PER_WINDOW);

      await expect(service.checkScanQuota("user-id")).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it("Should count only reports inside the rolling window", async () => {
      prisma.artworksReport.count.mockResolvedValue(0);

      await service.checkScanQuota("user-id");

      const where = prisma.artworksReport.count.mock.calls[0][0].where;
      expect(where.userId).toBe("user-id");
      expect(where.detectionDate.gt).toBeInstanceOf(Date);
    });
  });

  describe("generate", () => {
    const mockScanSuccess = () => {
      prisma.artworksReport.count.mockResolvedValue(0);
      artworksService.findAllPerUser.mockResolvedValue([
        { id: "a1", storageKey: "k1" },
        { id: "a2", storageKey: "k2" }
      ]);
      storageService.getImage.mockResolvedValue(Buffer.from(""));
      storageService.getDownloadUrl.mockResolvedValue("https://dl.example");
      visionService.searchImage.mockResolvedValue({ matchingPages: [] });
      serpApiLensService.searchImage.mockResolvedValue({ matchingPages: [] });
      matchingPagesService.createMany.mockResolvedValue({ matchingPages: [] });
      prisma.artworksReport.create.mockResolvedValue({ id: "report-1" });
      prisma.artwork.updateMany.mockResolvedValue({ count: 2 });
    };

    it("Should report progress to the job per artwork", async () => {
      mockScanSuccess();
      const job = { updateProgress: jest.fn().mockResolvedValue(undefined) };

      const report = await service.generate("user-id", job as never);

      expect(report).toEqual({ id: "report-1" });
      expect(job.updateProgress).toHaveBeenCalledWith({
        processed: 0,
        total: 2
      });
      expect(job.updateProgress).toHaveBeenLastCalledWith({
        processed: 2,
        total: 2
      });
    });

    it("Should generate without a job (scheduler path)", async () => {
      mockScanSuccess();

      const report = await service.generate("user-id");

      expect(report).toEqual({ id: "report-1" });
    });

    it("Should still complete the scan when one artwork's search fails", async () => {
      mockScanSuccess();
      // Two artworks; the first one's Lens call fails, the second succeeds.
      serpApiLensService.searchImage
        .mockReset()
        .mockRejectedValueOnce(new Error("lens timeout"))
        .mockResolvedValueOnce({ matchingPages: [] });

      const report = await service.generate("user-id");

      expect(report).toEqual({ id: "report-1" });
    });

    it("Should fail the scan (no report) when every artwork's search fails", async () => {
      mockScanSuccess();
      serpApiLensService.searchImage
        .mockReset()
        .mockRejectedValue(new Error("lens timeout"));

      await expect(service.generate("user-id")).rejects.toBeInstanceOf(
        ServiceUnavailableException
      );
      expect(prisma.artworksReport.create).not.toHaveBeenCalled();
    });

    it("Should normalize match URLs (strip query/fragment) before persisting", async () => {
      mockScanSuccess();
      artworksService.findAllPerUser.mockResolvedValue([
        { id: "a1", storageKey: "k1" }
      ]);
      const base = "https://x.com/ayaka_s/status/1777995868702171417";
      serpApiLensService.searchImage.mockReset().mockResolvedValue({
        matchingPages: [
          { url: `${base}?lang=es`, category: "SOCIAL" },
          { url: base, category: "SOCIAL" }
        ]
      });

      await service.generate("user-id");

      // Both provider results collapse onto the same canonical URL; the DB's
      // `skipDuplicates` on `[url, artworkId]` then dedupes them to one row.
      const persisted = matchingPagesService.createMany.mock.calls[0][0];
      expect(persisted.map((m: { url: string }) => m.url)).toEqual([base, base]);
    });

    it("Should not create a report when over quota", async () => {
      prisma.artworksReport.count.mockResolvedValue(MAX_SCANS_PER_WINDOW);

      await expect(service.generate("user-id")).rejects.toBeInstanceOf(
        ForbiddenException
      );
      expect(prisma.artworksReport.create).not.toHaveBeenCalled();
    });
  });

  describe("enqueueScan", () => {
    it("Should enqueue a job with a deterministic per-user id when none exists", async () => {
      prisma.artworksReport.count.mockResolvedValue(0);
      queue.getJob.mockResolvedValue(null);
      queue.add.mockResolvedValue({ id: "scan-user-id" });

      const res = await service.enqueueScan("user-id");

      expect(res).toEqual({ jobId: "scan-user-id" });
      expect(queue.add).toHaveBeenCalledWith(
        expect.anything(),
        { userId: "user-id" },
        expect.objectContaining({ jobId: "scan-user-id" })
      );
    });

    it("Should single-flight an already running scan instead of enqueuing again", async () => {
      prisma.artworksReport.count.mockResolvedValue(0);
      queue.getJob.mockResolvedValue({
        getState: jest.fn().mockResolvedValue("active"),
        timestamp: Date.now(),
        processedOn: Date.now()
      });

      const res = await service.enqueueScan("user-id");

      expect(res).toEqual({ jobId: "scan-user-id" });
      expect(queue.add).not.toHaveBeenCalled();
    });

    it("Should replace a terminal job so a fresh scan can run", async () => {
      prisma.artworksReport.count.mockResolvedValue(0);
      const remove = jest.fn().mockResolvedValue(undefined);
      queue.getJob.mockResolvedValue({
        getState: jest.fn().mockResolvedValue("completed"),
        timestamp: Date.now(),
        remove
      });
      queue.add.mockResolvedValue({ id: "scan-user-id" });

      const res = await service.enqueueScan("user-id");

      expect(remove).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalled();
      expect(res).toEqual({ jobId: "scan-user-id" });
    });

    it("Should reject before enqueuing when over quota", async () => {
      prisma.artworksReport.count.mockResolvedValue(MAX_SCANS_PER_WINDOW);

      await expect(service.enqueueScan("user-id")).rejects.toBeInstanceOf(
        ForbiddenException
      );
      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe("enqueueScheduledScan", () => {
    it("Should share the deterministic id and single-flight an in-flight scan", async () => {
      queue.getJob.mockResolvedValue({
        getState: jest.fn().mockResolvedValue("active")
      });

      await service.enqueueScheduledScan("user-id");

      expect(queue.getJob).toHaveBeenCalledWith("scan-user-id");
      expect(queue.add).not.toHaveBeenCalled();
    });

    it("Should enqueue with retry options when no job exists", async () => {
      queue.getJob.mockResolvedValue(null);
      queue.add.mockResolvedValue({ id: "scan-user-id" });

      await service.enqueueScheduledScan("user-id");

      expect(queue.add).toHaveBeenCalledWith(
        expect.anything(),
        { userId: "user-id" },
        expect.objectContaining({ jobId: "scan-user-id", attempts: 3 })
      );
    });

    it("Should not check the interactive quota (enforced later in generate)", async () => {
      queue.getJob.mockResolvedValue(null);
      queue.add.mockResolvedValue({ id: "scan-user-id" });

      await service.enqueueScheduledScan("user-id");

      expect(prisma.artworksReport.count).not.toHaveBeenCalled();
    });
  });

  describe("getScanStatus", () => {
    it("Should return the reportId when the job is completed", async () => {
      queue.getJob.mockResolvedValue({
        data: { userId: "user-id" },
        getState: jest.fn().mockResolvedValue("completed"),
        progress: { processed: 2, total: 2 },
        returnvalue: "report-1",
        failedReason: undefined
      });

      const res = await service.getScanStatus("user-id", "scan-user-id");

      expect(res).toMatchObject({
        jobId: "scan-user-id",
        state: "completed",
        progress: { processed: 2, total: 2 },
        reportId: "report-1"
      });
    });

    it("Should throw when the job does not exist", async () => {
      queue.getJob.mockResolvedValue(null);

      await expect(
        service.getScanStatus("user-id", "scan-user-id")
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("Should throw when the job belongs to another user", async () => {
      queue.getJob.mockResolvedValue({
        data: { userId: "someone-else" },
        getState: jest.fn().mockResolvedValue("active")
      });

      await expect(
        service.getScanStatus("user-id", "scan-user-id")
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("Should throw when the job was evicted (unknown state)", async () => {
      queue.getJob.mockResolvedValue({
        data: { userId: "user-id" },
        getState: jest.fn().mockResolvedValue("unknown")
      });

      await expect(
        service.getScanStatus("user-id", "scan-user-id")
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("getGlobalStatistics", () => {
    it("Should aggregate distinct matches per category and sum them (range=all)", async () => {
      cache.get.mockResolvedValue(undefined);
      prisma.matchingPage.groupBy.mockResolvedValue([
        { category: "SOCIAL", _count: { _all: 3 } },
        { category: "MARKETPLACES", _count: { _all: 2 } }
      ]);
      // The timeline query orders by detectionDate desc (most-recent first) and
      // the service reverses it back to ascending for display.
      prisma.artworksReport.findMany.mockResolvedValue([
        {
          id: "r2",
          detectionDate: new Date("2026-07-01T00:00:00Z"),
          _count: { matchingPages: 5 }
        },
        {
          id: "r1",
          detectionDate: new Date("2026-06-01T00:00:00Z"),
          _count: { matchingPages: 4 }
        }
      ]);

      const res = await service.getGlobalStatistics("user-id");

      expect(res.totalMatches).toBe(5);
      expect(res.categoryDistribution).toEqual([
        { category: "SOCIAL", count: 3 },
        { category: "MARKETPLACES", count: 2 }
      ]);
      expect(res.timeline).toEqual([
        { reportId: "r1", date: "2026-06-01T00:00:00.000Z", totalMatches: 4 },
        { reportId: "r2", date: "2026-07-01T00:00:00.000Z", totalMatches: 5 }
      ]);
    });

    it("Should cap the timeline to the most recent reports, spanning all reports regardless of range", async () => {
      cache.get.mockResolvedValue(undefined);
      prisma.matchingPage.groupBy.mockResolvedValue([]);
      prisma.artworksReport.findMany.mockResolvedValue([]);

      // Even with range=month the timeline must NOT be scoped to the month
      // window — the bar chart always spans every report, just capped.
      await service.getGlobalStatistics("user-id", undefined, "month");

      const timelineCall = prisma.artworksReport.findMany.mock.calls[0][0];
      expect(timelineCall.take).toBe(TIMELINE_MAX_POINTS);
      expect(timelineCall.orderBy).toEqual({ detectionDate: "desc" });
      expect(timelineCall.where).toEqual({ userId: "user-id" });
    });

    it("Should cache the range=all result on a miss and serve subsequent hits", async () => {
      cache.get.mockResolvedValue(undefined);
      prisma.matchingPage.groupBy.mockResolvedValue([]);
      prisma.artworksReport.findMany.mockResolvedValue([]);

      await service.getGlobalStatistics("user-id");

      expect(cache.set).toHaveBeenCalledWith(
        "reports:statistics:v2:user-id:all",
        expect.objectContaining({ totalMatches: 0 }),
        expect.any(Number)
      );

      const cached = {
        totalMatches: 9,
        categoryDistribution: [],
        timeline: []
      };
      cache.get.mockResolvedValue(cached);

      const res = await service.getGlobalStatistics("user-id");

      expect(res).toBe(cached);
      // groupBy was only called for the first (miss) invocation.
      expect(prisma.matchingPage.groupBy).toHaveBeenCalledTimes(1);
    });

    it("Should filter by a rolling 30-day window and not touch the cache (range=month)", async () => {
      prisma.matchingPage.groupBy.mockResolvedValue([]);
      prisma.artworksReport.findMany.mockResolvedValue([]);

      await service.getGlobalStatistics("user-id", undefined, "month");

      expect(cache.get).not.toHaveBeenCalled();
      expect(cache.set).not.toHaveBeenCalled();

      const where = prisma.matchingPage.groupBy.mock.calls[0][0].where;
      expect(where.reports.some.userId).toBe("user-id");
      expect(where.reports.some.detectionDate.gt).toBeInstanceOf(Date);
    });

    it("Should return zeros for a user with no reports without throwing", async () => {
      cache.get.mockResolvedValue(undefined);
      prisma.matchingPage.groupBy.mockResolvedValue([]);
      prisma.artworksReport.findMany.mockResolvedValue([]);

      const res = await service.getGlobalStatistics("user-id");

      expect(res).toEqual({
        totalMatches: 0,
        categoryDistribution: [],
        timeline: []
      });
    });

    it("Should scope to a specific report (and its owner) and bypass the cache", async () => {
      prisma.matchingPage.groupBy.mockResolvedValue([
        { category: "BLOG", _count: { _all: 1 } }
      ]);
      prisma.artworksReport.findMany.mockResolvedValue([]);

      const res = await service.getGlobalStatistics("user-id", "report-1");

      expect(cache.get).not.toHaveBeenCalled();
      expect(cache.set).not.toHaveBeenCalled();
      expect(res.totalMatches).toBe(1);

      const where = prisma.matchingPage.groupBy.mock.calls[0][0].where;
      expect(where.reports.some).toEqual({ id: "report-1", userId: "user-id" });
    });
  });

  describe("findMatchesByCategory", () => {
    it("Should filter by category and the user's reports, newest first (range=all)", async () => {
      const pages = [{ id: "m1" }, { id: "m2" }];
      prisma.matchingPage.findMany.mockResolvedValue(pages);

      const res = await service.findMatchesByCategory("user-id", "SOCIAL");

      expect(res).toBe(pages);
      const arg = prisma.matchingPage.findMany.mock.calls[0][0];
      expect(arg.where.category).toBe("SOCIAL");
      expect(arg.where.reports.some.userId).toBe("user-id");
      expect(arg.where.reports.some.detectionDate).toBeUndefined();
      expect(arg.orderBy).toEqual({ firstDetectedAt: "desc" });
      expect(arg.take).toBe(MATCHES_MODAL_LIMIT);
    });

    it("Should add the rolling 30-day window when range=month", async () => {
      prisma.matchingPage.findMany.mockResolvedValue([]);

      await service.findMatchesByCategory("user-id", "MARKETPLACES", "month");

      const where = prisma.matchingPage.findMany.mock.calls[0][0].where;
      expect(where.category).toBe("MARKETPLACES");
      expect(where.reports.some.detectionDate.gt).toBeInstanceOf(Date);
    });
  });

  describe("findMatchesByReport", () => {
    it("Should return the report's matches scoped to the owner, newest-first and capped at the DB", async () => {
      prisma.artworksReport.findUniqueOrThrow.mockResolvedValue({
        userId: "user-id"
      });
      const pages = [{ id: "m1" }, { id: "m2" }];
      prisma.matchingPage.findMany.mockResolvedValue(pages);

      const res = await service.findMatchesByReport("user-id", "report-1");

      expect(res).toBe(pages);
      const arg = prisma.matchingPage.findMany.mock.calls[0][0];
      expect(arg.where.reports.some).toEqual({ id: "report-1", userId: "user-id" });
      expect(arg.orderBy).toEqual({ firstDetectedAt: "desc" });
      expect(arg.take).toBe(MATCHES_MODAL_LIMIT);
    });

    it("Should throw ownership error and not query matches when the report isn't the user's", async () => {
      prisma.artworksReport.findUniqueOrThrow.mockResolvedValue({
        userId: "someone-else"
      });

      await expect(
        service.findMatchesByReport("user-id", "report-1")
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.matchingPage.findMany).not.toHaveBeenCalled();
    });
  });
});
