import { Test, TestingModule } from "@nestjs/testing";
import { Job } from "bullmq";
import { PUBLIC_SCAN_PREVIEW_MATCHES } from "@vigilart/shared";
import { PublicScanProcessor } from "./public-scan.processor";
import { VisualSearchService } from "../visualsearch/visual-search.service";
import { StorageService } from "../storage/storage.service";
import { PUBLIC_SCAN_JOB } from "./public-scan.constants";

const match = (url: string, category = "SOCIAL") =>
  ({ url, category, websiteName: "example", unsafeDomain: false }) as never;

const job = (storageKey = "public-scans/abc.png") =>
  ({ name: PUBLIC_SCAN_JOB, data: { storageKey } }) as Job<{
    storageKey: string;
  }>;

describe("PublicScanProcessor", () => {
  let processor: PublicScanProcessor;
  let visualSearch: { aggregate: jest.Mock };
  let storage: { getDownloadUrl: jest.Mock; deleteImage: jest.Mock };

  beforeEach(async () => {
    visualSearch = { aggregate: jest.fn() };
    storage = {
      getDownloadUrl: jest.fn().mockResolvedValue("https://dl.example"),
      deleteImage: jest.fn().mockResolvedValue(undefined)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicScanProcessor,
        { provide: VisualSearchService, useValue: visualSearch },
        { provide: StorageService, useValue: storage }
      ]
    }).compile();

    processor = module.get(PublicScanProcessor);
  });

  // The account gate is the truncation. If the full list came back, every
  // hidden match would sit in the response one devtools panel away.
  it("Should return only the preview slice while counting every match", async () => {
    visualSearch.aggregate.mockResolvedValue([
      match("https://a.example/1"),
      match("https://b.example/2"),
      match("https://c.example/3"),
      match("https://d.example/4"),
      match("https://e.example/5")
    ]);

    const result = await processor.process(job());

    expect(result!.totalMatches).toBe(5);
    expect(result!.matches).toHaveLength(PUBLIC_SCAN_PREVIEW_MATCHES);
  });

  // Providers return the same page under different query strings; counting
  // both would inflate the headline number the page leads with.
  it("Should collapse matches that differ only by query string", async () => {
    visualSearch.aggregate.mockResolvedValue([
      match("https://a.example/art?lang=es"),
      match("https://a.example/art"),
      match("https://b.example/art#top")
    ]);

    const result = await processor.process(job());

    expect(result!.totalMatches).toBe(2);
  });

  it("Should group counts by category, busiest first", async () => {
    visualSearch.aggregate.mockResolvedValue([
      match("https://a.example/1", "MARKETPLACES"),
      match("https://b.example/2", "MARKETPLACES"),
      match("https://c.example/3", "SOCIAL")
    ]);

    const result = await processor.process(job());

    expect(result!.categories).toEqual([
      { category: "MARKETPLACES", count: 2 },
      { category: "SOCIAL", count: 1 }
    ]);
  });

  it("Should delete the visitor's image after a successful scan", async () => {
    visualSearch.aggregate.mockResolvedValue([]);

    await processor.process(job("public-scans/xyz.png"));

    expect(storage.deleteImage).toHaveBeenCalledWith("public-scans/xyz.png");
  });

  // The page promises deletion outright, not deletion-if-it-worked.
  it("Should delete the image even when the search fails", async () => {
    visualSearch.aggregate.mockRejectedValue(new Error("lens down"));

    await expect(processor.process(job())).rejects.toThrow("lens down");
    expect(storage.deleteImage).toHaveBeenCalledTimes(1);
  });

  // A bucket that refuses the delete must not turn a paid, successful scan
  // into a failure the visitor has to pay for again.
  it("Should still return the result when the delete fails", async () => {
    visualSearch.aggregate.mockResolvedValue([match("https://a.example/1")]);
    storage.deleteImage.mockRejectedValue(new Error("r2 down"));

    const result = await processor.process(job());

    expect(result!.totalMatches).toBe(1);
  });
});
