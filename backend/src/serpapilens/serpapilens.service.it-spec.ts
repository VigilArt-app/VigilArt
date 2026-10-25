import { Test } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { of, throwError } from "rxjs";
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

  // Payloads from https://serpapi.com/api-status-and-error-codes
  it("returns null when Google found nothing (status Success)", async () => {
    httpService.get.mockReturnValue(
      mockResponse({
        search_metadata: { status: "Success" },
        error: "Google hasn't returned any results for this query."
      })
    );

    await expect(service.searchImage("https://img/download")).resolves.toBeNull();
  });

  it("fails instead of returning zero matches when SerpApi answers 200 with status Error", async () => {
    httpService.get.mockReturnValue(
      mockResponse({
        search_metadata: { status: "Error" },
        error: "We couldn't get valid results for this search. Please try again later."
      })
    );

    await expect(service.searchImage("https://img/download")).rejects.toMatchObject({
      failure: "provider_error"
    });
  });

  describe("HTTP failures", () => {
    const signedUrl = "https://bucket.r2.example/artworks/a.jpg?X-Amz-Signature=secret-signature";
    const httpError = (status: number | undefined, code?: string) =>
      new AxiosError(
        status ? `Request failed with status code ${status}` : "timeout of 120000ms exceeded",
        code,
        { url: "https://serpapi.com/search", params: { api_key: "test-key", url: signedUrl } } as never,
        undefined,
        status ? ({ status, data: { error: "Some SerpApi error" } } as never) : undefined
      );

    it.each([
      [429, undefined, "rate_limit"],
      [503, undefined, "provider_error"],
      [500, undefined, "provider_error"],
      [401, undefined, "invalid_config"],
      [undefined, "ECONNABORTED", "timeout"]
    ])("classifies HTTP %s %s as %s", async (status, code, failure) => {
      httpService.get.mockReturnValue(throwError(() => httpError(status, code)));

      await expect(service.searchImage(signedUrl)).rejects.toMatchObject({ failure });
    });

    it("never puts the API key or the signed image URL in the error", async () => {
      httpService.get.mockReturnValue(throwError(() => httpError(503)));

      const error = await service.searchImage(signedUrl).catch((e: unknown) => e);

      const text = JSON.stringify({ ...(error as object), message: (error as Error).message });
      expect(text).not.toContain("test-key");
      expect(text).not.toContain("secret-signature");
    });
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
