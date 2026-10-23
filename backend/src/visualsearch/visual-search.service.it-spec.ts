import { Test, TestingModule } from "@nestjs/testing";
import { ServiceUnavailableException } from "@nestjs/common";
import { VisualSearchService } from "./visual-search.service";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { SerpApiLensService } from "../serpapilens/serpapilens.service";

describe("VisualSearchService", () => {
  let service: VisualSearchService;
  let serpApiLensService: { searchImage: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisualSearchService,
        { provide: GoogleLensService, useValue: { searchImage: jest.fn() } },
        { provide: SerpApiLensService, useValue: { searchImage: jest.fn() } }
      ]
    }).compile();

    service = module.get(VisualSearchService);
    serpApiLensService = module.get(SerpApiLensService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("aggregate", () => {
    it("Should return Google Lens matches", async () => {
      serpApiLensService.searchImage.mockResolvedValue({
        matchingPages: [{ url: "https://b.example" }]
      });

      const res = await service.aggregate("https://download.example");

      expect(res).toEqual([{ url: "https://b.example" }]);
    });

    it("Should return an empty array for a genuine zero-match scan", async () => {
      serpApiLensService.searchImage.mockResolvedValue({ matchingPages: [] });

      const res = await service.aggregate("https://download.example");

      expect(res).toEqual([]);
    });

    // A provider that answers `null` (no exact_matches array in the payload)
    // is not a failure: the scan ran and found nothing.
    it("Should return an empty array when the provider answers null", async () => {
      serpApiLensService.searchImage.mockResolvedValue(null);

      const res = await service.aggregate("https://download.example");

      expect(res).toEqual([]);
    });

    it("Should throw when all providers fail", async () => {
      serpApiLensService.searchImage.mockRejectedValue(new Error("lens down"));

      await expect(
        service.aggregate("https://download.example")
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });
});
