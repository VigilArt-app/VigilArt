import { Test, TestingModule } from "@nestjs/testing";
import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { getQueueToken } from "@nestjs/bullmq";
import { ReportsService } from "./reports.service";
import { VisionService } from "../vision/vision.service";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { ArtworksService } from "../artworks/artworks.service";
import { StorageService } from "../storage/storage.service";
import { MatchingPagesService } from "./matchingPage.service";
import { PrismaService } from "../prisma/prisma.service";
import { MAX_SCANS_PER_WINDOW, REPORTS_QUEUE } from "./reports.constants";

describe("ReportsService", () => {
  let service: ReportsService;
  let visionService: { searchImage: jest.Mock };
  let googleLensService: { searchImage: jest.Mock };
  let artworksService: { findAllPerUser: jest.Mock };
  let storageService: { getImage: jest.Mock; getDownloadUrl: jest.Mock };
  let matchingPagesService: { createMany: jest.Mock };
  let prisma: {
    artworksReport: { count: jest.Mock; create: jest.Mock };
    artwork: { updateMany: jest.Mock };
  };
  let queue: { add: jest.Mock; getJob: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: VisionService, useValue: { searchImage: jest.fn() } },
        { provide: GoogleLensService, useValue: { searchImage: jest.fn() } },
        { provide: ArtworksService, useValue: { findAllPerUser: jest.fn() } },
        {
          provide: StorageService,
          useValue: { getImage: jest.fn(), getDownloadUrl: jest.fn() }
        },
        { provide: MatchingPagesService, useValue: { createMany: jest.fn() } },
        {
          provide: PrismaService,
          useValue: {
            artworksReport: { count: jest.fn(), create: jest.fn() },
            artwork: { updateMany: jest.fn() }
          }
        },
        { provide: CACHE_MANAGER, useValue: { del: jest.fn() } },
        {
          provide: getQueueToken(REPORTS_QUEUE),
          useValue: { add: jest.fn(), getJob: jest.fn() }
        }
      ]
    }).compile();

    service = module.get(ReportsService);
    visionService = module.get(VisionService);
    googleLensService = module.get(GoogleLensService);
    artworksService = module.get(ArtworksService);
    storageService = module.get(StorageService);
    matchingPagesService = module.get(MatchingPagesService);
    prisma = module.get(PrismaService);
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
      googleLensService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://b.example" }]
      });

      const res = await service.aggregateVisualSearchResults(
        "https://download.example"
      );

      expect(res).toEqual([{ url: "https://b.example" }]);
    });

    it("Should return the surviving provider's matches when one provider fails", async () => {
      visionService.searchImage.mockRejectedValue(new Error("vision down"));
      googleLensService.searchImage.mockResolvedValue({
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
      googleLensService.searchImage.mockResolvedValue({ matchingPages: [] });

      const res = await service.aggregateVisualSearchResults(
        // Buffer.from(""),
        "https://download.example"
      );

      expect(res).toEqual([]);
    });

    it("Should throw when all providers fail", async () => {
      visionService.searchImage.mockRejectedValue(new Error("vision down"));
      googleLensService.searchImage.mockRejectedValue(new Error("lens down"));

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
      googleLensService.searchImage.mockResolvedValue({ matchingPages: [] });
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
});
