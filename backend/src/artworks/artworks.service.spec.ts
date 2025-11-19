import { Test, TestingModule } from "@nestjs/testing";
import { ArtworksService } from "./artworks.service";

describe("ArtworksService", () => {
  let service: ArtworksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtworksService],
    }).compile();

    service = module.get<ArtworksService>(ArtworksService);
  });

  it("Should be defined", () => {
    expect(service).toBeDefined();
  });

  it("Should return web detection result for a specific artwork", async () => {
    const res: any = {};

    expect(res.id).toEqual(expect.any(String));
    expect(res.detectionDate).toEqual(expect.any(String));
    expect(res.statistics).toEqual({
      totalMatches: expect.any(Number),
      totalFullMatchingImages: expect.any(Number),
      totalPartialMatchingImages: expect.any(Number),
    });
    expect(res.statistics.totalMatches).toBeGreaterThanOrEqual(0);
    expect(res.statistics.totalFullMatchingImages).toBeGreaterThanOrEqual(0);
    expect(res.statistics.totalPartialMatchingImages).toBeGreaterThanOrEqual(0);

    expect(Array.isArray(res.metadata.bestGuessLabels)).toBe(true);
    res.metadata.bestGuessLabels.forEach((value: any) => {
      expect(value).toEqual({
        label: expect.any(Number),
        languageCode: expect.any(String),
      });
    });

    expect(Array.isArray(res.metadata.webEntities)).toBe(true);
    res.metadata.webEntities.forEach((value: any) => {
      expect(value).toEqual({
        score: expect.any(Number),
        description: expect.any(String),
      });
    });

    expect(Array.isArray(res.fullMatchingImages)).toBe(true);
    res.fullMatchingImages.forEach((image: any) => {
      expect(image.url).toEqual(expect.any(String));
      expect(image.category).toEqual(expect.any(String));
      expect(image.websiteName).toEqual(expect.any(String));

      if (image.pageUrl !== undefined) {
        expect(image.pageUrl).toEqual(expect.any(String));
      }
      if (image.pageTitle !== undefined) {
        expect(image.pageTitle).toEqual(expect.any(String));
      }
    });

    expect(Array.isArray(res.partialMatchingImages)).toBe(true);
    res.partialMatchingImages.forEach((image: any) => {
      expect(image.url).toEqual(expect.any(String));
      expect(image.category).toEqual(expect.any(String));
      expect(image.websiteName).toEqual(expect.any(String));

      if (image.pageUrl !== undefined) {
        expect(image.pageUrl).toEqual(expect.any(String));
      }
      if (image.pageTitle !== undefined) {
        expect(image.pageTitle).toEqual(expect.any(String));
      }
    });
  });
});
