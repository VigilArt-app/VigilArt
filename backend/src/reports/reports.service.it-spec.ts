import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException, ServiceUnavailableException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ReportsService } from "./reports.service";
import { VisionService } from "../vision/vision.service";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { ArtworksService } from "../artworks/artworks.service";
import { StorageService } from "../storage/storage.service";
import { MatchingPagesService } from "./matchingPage.service";
import { PrismaService } from "../prisma/prisma.service";
import { MAX_SCANS_PER_WINDOW } from "./reports.constants";

describe("ReportsService", () => {
  let service: ReportsService;
  let visionService: { searchImage: jest.Mock };
  let googleLensService: { searchImage: jest.Mock };
  let prisma: { artworksReport: { count: jest.Mock } };

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
        { provide: CACHE_MANAGER, useValue: { del: jest.fn() } }
      ]
    }).compile();

    service = module.get(ReportsService);
    visionService = module.get(VisionService);
    googleLensService = module.get(GoogleLensService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("aggregateVisualSearchResults", () => {
    it("Should merge matches from both providers", async () => {
      visionService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://a.example" }]
      });
      googleLensService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://b.example" }]
      });

      const res = await service.aggregateVisualSearchResults(
        Buffer.from(""),
        "https://download.example"
      );

      expect(res).toEqual([
        { url: "https://a.example" },
        { url: "https://b.example" }
      ]);
    });

    it("Should return the surviving provider's matches when one provider fails", async () => {
      visionService.searchImage.mockRejectedValue(new Error("vision down"));
      googleLensService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://b.example" }]
      });

      const res = await service.aggregateVisualSearchResults(
        Buffer.from(""),
        "https://download.example"
      );

      expect(res).toEqual([{ url: "https://b.example" }]);
    });

    it("Should return an empty array for a genuine zero-match scan", async () => {
      visionService.searchImage.mockResolvedValue(null);
      googleLensService.searchImage.mockResolvedValue({ matchingPages: [] });

      const res = await service.aggregateVisualSearchResults(
        Buffer.from(""),
        "https://download.example"
      );

      expect(res).toEqual([]);
    });

    it("Should throw when all providers fail", async () => {
      visionService.searchImage.mockRejectedValue(new Error("vision down"));
      googleLensService.searchImage.mockRejectedValue(new Error("lens down"));

      await expect(
        service.aggregateVisualSearchResults(
          Buffer.from(""),
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
});
