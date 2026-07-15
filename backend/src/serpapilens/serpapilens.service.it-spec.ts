import { Test } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of } from "rxjs";
import { SerpApiLensService } from "./serpapilens.service";

describe("SerpApiLensService", () => {
  let service: SerpApiLensService;
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        SerpApiLensService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: { getOrThrow: () => "test-key" } }
      ]
    }).compile();
    service = module.get(SerpApiLensService);
  });

  const mockResponse = (data: unknown) => of({ data } as never);

  it("maps exact_matches into matching pages", async () => {
    httpService.get.mockReturnValue(
      mockResponse({
        exact_matches: [
          {
            title: "Stolen art",
            link: "https://example-marketplace.com/item/1",
            thumbnail: "https://serpapi.com/thumb.png",
            image: "https://cdn.example.com/full.png"
          }
        ]
      })
    );

    const res = await service.searchImage("https://img/download");

    expect(res).not.toBeNull();
    expect(res!.matchingPages).toHaveLength(1);
    expect(res!.matchingPages[0]).toMatchObject({
      url: "https://example-marketplace.com/item/1",
      imageUrl: "https://serpapi.com/thumb.png",
      pageTitle: "Stolen art"
    });
  });

  it("falls back to image when thumbnail is absent", async () => {
    httpService.get.mockReturnValue(
      mockResponse({
        exact_matches: [
          { link: "https://ok.com/x", image: "https://cdn.example.com/full.png" }
        ]
      })
    );

    const res = await service.searchImage("https://img/download");

    expect(res!.matchingPages[0].imageUrl).toBe(
      "https://cdn.example.com/full.png"
    );
  });

  it("skips matches without a link", async () => {
    httpService.get.mockReturnValue(
      mockResponse({
        exact_matches: [{ title: "no link" }, { link: "https://ok.com/x" }]
      })
    );

    const res = await service.searchImage("https://img/download");

    expect(res!.matchingPages).toHaveLength(1);
    expect(res!.matchingPages[0].url).toBe("https://ok.com/x");
  });

  it("returns null when the response has no exact_matches", async () => {
    httpService.get.mockReturnValue(mockResponse({ images: [] }));

    const res = await service.searchImage("https://img/download");

    expect(res).toBeNull();
  });

  it("queries SerpAPI google_lens with the exact_matches type", async () => {
    httpService.get.mockReturnValue(mockResponse({ exact_matches: [] }));

    await service.searchImage("https://img/download");

    expect(httpService.get).toHaveBeenCalledWith(
      "https://serpapi.com/search",
      expect.objectContaining({
        params: expect.objectContaining({
          engine: "google_lens",
          type: "exact_matches",
          url: "https://img/download"
        })
      })
    );
  });
});
