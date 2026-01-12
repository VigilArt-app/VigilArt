import { Test, TestingModule } from "@nestjs/testing";
import { ReportsService } from "./reports.service";
import { VisionService } from "../vision/vision.service";
import { ArtworksService } from "../artworks/artworks.service";
import {
  mockedAggregatedResults,
  mockedArtwork,
  mockedArtworks,
  mockedArtworksReportEntries,
  mockedFilteredArtworksReportEntries,
  mockedSearchImageReturnValue,
} from "./sample-inputs";
import { AggregatedVisualSearchResults } from "@vigilart/shared";
import { ArtworksReportEntry, WebsiteCategory } from "@vigilart/shared";
import { NotFoundException } from "@nestjs/common";

describe("ReportsService", () => {
  let service: ReportsService;
  let visionService: VisionService;
  let artworksService: ArtworksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: VisionService,
          useValue: {
            searchImage: jest.fn(),
          },
        },
        {
          provide: ArtworksService,
          useValue: {
            findAllPerUser: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    visionService = module.get<VisionService>(VisionService);
    artworksService = module.get<ArtworksService>(ArtworksService);
  });

  it("Should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("aggregateVisualSearchResults", () => {
    it("Should correctly aggregrate visual search results and calculate artwork statistics", async () => {
      jest
        .spyOn(visionService, "searchImage")
        .mockResolvedValue(mockedSearchImageReturnValue);
      const res: AggregatedVisualSearchResults =
        await service.aggregateVisualSearchResults("imageUri");

      expect(res.matchingPages).toEqual(
        mockedSearchImageReturnValue.matchingPages
      );
      expect(res.statistics).toEqual({
        totalMatches: 4,
      });
    });

    it("Should handle null response from Vision service", async () => {
      const spy = jest
        .spyOn(visionService, "searchImage")
        .mockResolvedValue(null);

      const res = await service.aggregateVisualSearchResults("imageUri");

      expect(spy).toHaveBeenCalledWith("imageUri");
      expect(res.matchingPages).toEqual([]);
      expect(res.statistics.totalMatches).toBe(0);
    });
  });

  describe("getArtworksReportEntry", () => {
    beforeEach(() => {
      jest
        .spyOn(service, "aggregateVisualSearchResults")
        .mockResolvedValue(mockedAggregatedResults);
    });

    it("Should return full artworks report entry without limit", async () => {
      const res: ArtworksReportEntry = await service.getArtworksReportEntry(
        mockedArtwork
      );
      expect(res.artworkId).toEqual("1");
      expect(res.statistics).toEqual({ totalMatches: 4 });
      expect(res.matchingPages).toEqual(
        mockedSearchImageReturnValue.matchingPages
      );
    });

    it("Should limit matching pages when limit is specified", async () => {
      const res: ArtworksReportEntry = await service.getArtworksReportEntry(
        mockedArtwork,
        2
      );
      expect(res.artworkId).toEqual("1");
      expect(res.statistics).toEqual({ totalMatches: 4 });
      expect(res.matchingPages).toEqual(
        mockedSearchImageReturnValue.matchingPages.slice(0, 2)
      );
    });

    it("Should handle limit larger than available matching pages", async () => {
      jest
        .spyOn(service, "aggregateVisualSearchResults")
        .mockResolvedValue(mockedAggregatedResults);
      const res = await service.getArtworksReportEntry(mockedArtwork, 100);

      expect(res.matchingPages).toHaveLength(4);
    });

    it("Should handle limit of 0", async () => {
      const res = await service.getArtworksReportEntry(mockedArtwork, 0);

      expect(res.matchingPages).toHaveLength(0);
    });
  });

  describe("getArtworksReportEntries", () => {
    beforeEach(() => {
      jest
        .spyOn(service, "aggregateVisualSearchResults")
        .mockResolvedValue(mockedAggregatedResults);
      jest
        .spyOn(artworksService, "findAllPerUser")
        .mockResolvedValue(mockedArtworks);
    });

    it("Should return list of artworks report entries without matches limit", async () => {
      const res = await service.getArtworksReportEntries("0");
      const expectedEntry = {
        statistics: { totalMatches: 4 },
        matchingPages: mockedSearchImageReturnValue.matchingPages,
      };

      expect(res).toEqual([
        {
          artworkId: "1",
          ...expectedEntry,
        },
        {
          artworkId: "2",
          ...expectedEntry,
        },
        {
          artworkId: "3",
          ...expectedEntry,
        },
        {
          artworkId: "4",
          ...expectedEntry,
        },
      ]);
    });

    it("Should return list of artworks report entries when limit is specified", async () => {
      const res = await service.getArtworksReportEntries("0", 2);
      const expectedEntry = {
        statistics: { totalMatches: 4 },
        matchingPages: mockedSearchImageReturnValue.matchingPages.slice(0, 2),
      };

      expect(res).toEqual([
        {
          artworkId: "1",
          ...expectedEntry,
        },
        {
          artworkId: "2",
          ...expectedEntry,
        },
        {
          artworkId: "3",
          ...expectedEntry,
        },
        {
          artworkId: "4",
          ...expectedEntry,
        },
      ]);
    });

    it("Should handle limit larger than available matching pages", async () => {
      const res = await service.getArtworksReportEntries("0", 100);
      const expectedEntry = {
        statistics: { totalMatches: 4 },
        matchingPages: mockedSearchImageReturnValue.matchingPages.slice(0, 100),
      };

      expect(res).toEqual([
        {
          artworkId: "1",
          ...expectedEntry,
        },
        {
          artworkId: "2",
          ...expectedEntry,
        },
        {
          artworkId: "3",
          ...expectedEntry,
        },
        {
          artworkId: "4",
          ...expectedEntry,
        },
      ]);
    });

    it("Should handle limit of 0", async () => {
      const res = await service.getArtworksReportEntries("0", 0);
      const expectedEntry = {
        statistics: { totalMatches: 4 },
        matchingPages: mockedSearchImageReturnValue.matchingPages.slice(0, 0),
      };

      expect(res).toEqual([
        {
          artworkId: "1",
          ...expectedEntry,
        },
        {
          artworkId: "2",
          ...expectedEntry,
        },
        {
          artworkId: "3",
          ...expectedEntry,
        },
        {
          artworkId: "4",
          ...expectedEntry,
        },
      ]);
    });

    it("Should handle non-existent user ID", async () => {
      jest.spyOn(artworksService, "findAllPerUser").mockResolvedValue([]);

      const res = await service.getArtworksReportEntries("0");
      expect(res).toEqual([]);
    });
  });

  describe("getArtworksReportStatistics", () => {
    beforeEach(() => {});

    it("Should return global statistics about all artworks", () => {
      const res = service.getArtworksReportStatistics(
        mockedFilteredArtworksReportEntries
      );

      expect(res).toEqual({
        totalMatches: 12,
      });
    });

    it("Should handle no entries", () => {
      const res = service.getArtworksReportStatistics([]);

      expect(res).toEqual({
        totalMatches: 0,
      });
    });
  });

  describe("getArtworksReport", () => {
    it("Should return artworks report", async () => {
      jest
        .spyOn(service, "getArtworksReportEntries")
        .mockResolvedValue(mockedFilteredArtworksReportEntries);
      const res = await service.getArtworksReport("0");

      expect(res).toEqual({
        detectionDate: expect.any(Date),
        statistics: { totalMatches: 12 },
        entries: mockedFilteredArtworksReportEntries,
      });
    });

    it("Should handle no entries", async () => {
      jest.spyOn(service, "getArtworksReportEntries").mockResolvedValue([]);
      const res = await service.getArtworksReport("0");

      expect(res).toEqual({
        detectionDate: expect.any(Date),
        statistics: { totalMatches: 0 },
        entries: [],
      });
    });
  });

  describe("getArtworkMatches", () => {
    it("Should return all matching pages of an artwork without filter", async () => {
      jest.spyOn(artworksService, "findOne").mockResolvedValue(mockedArtwork);
      jest
        .spyOn(service, "aggregateVisualSearchResults")
        .mockResolvedValue(mockedAggregatedResults);
      const res = await service.getArtworkMatches(mockedArtwork.id, {});

      expect(res).toEqual(mockedSearchImageReturnValue.matchingPages);
    });

    it("Should handle artwork not found", async () => {
      const f = service.getArtworkMatches(mockedArtwork.id, {});

      await expect(f).rejects.toThrow(
        new NotFoundException("Artwork not found")
      );
    });

    it("Should handle filter", async () => {
      jest.spyOn(artworksService, "findOne").mockResolvedValue(mockedArtwork);
      jest
        .spyOn(service, "aggregateVisualSearchResults")
        .mockResolvedValue(mockedAggregatedResults);
      const res = await service.getArtworkMatches(mockedArtwork.id, {
        websiteCategory: WebsiteCategory.ART_PLATFORMS,
      });

      expect(res).toEqual([
        {
          url: "artstation.com/artist",
          pageTitle: "Ebay art sold",
          category: WebsiteCategory.ART_PLATFORMS,
          websiteName: "artstation.com",
          imageUrl: "imageUri",
        },
      ]);
    });
  });

  describe("getAllArtworksMatches", () => {
    it("Should return all matches pages found for all artworks of a user without filter", async () => {
      jest
        .spyOn(service, "getArtworksReportEntries")
        .mockResolvedValue(mockedArtworksReportEntries);
      const res = await service.getAllArtworksMatches(mockedArtwork.id, {});
      const expectedRes = [
        ...mockedSearchImageReturnValue.matchingPages,
        ...mockedSearchImageReturnValue.matchingPages,
        ...mockedSearchImageReturnValue.matchingPages,
      ];

      expect(res).toEqual(expectedRes);
    });

    it("Should handle filter", async () => {
      jest
        .spyOn(service, "getArtworksReportEntries")
        .mockResolvedValue(mockedArtworksReportEntries);
      const res = await service.getAllArtworksMatches(mockedArtwork.id, {
        websiteCategory: WebsiteCategory.SOCIAL,
      });
      const expectedArtworkMatches = [
        {
          url: "https://in.pinterest.com/rukminidubey/illustration-light-tone/",
          pageTitle:
            "Discover 21 Illustration Light tone and cute drawings ideas",
          category: WebsiteCategory.SOCIAL,
          websiteName: "pinterest.com",
          imageUrl:
            "https://i.pinimg.com/236x/b0/42/f7/b042f7f4d3583298407291b0a8882fef.jpg",
        },
        {
          url: "https://emblask.tumblr.com/post/650058868223819776",
          pageTitle: "Ayaka Suda illustration - Tumblr",
          category: WebsiteCategory.SOCIAL,
          websiteName: "tumblr.com",
          imageUrl:
            "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg",
        },
      ];
      const expectedRes = [
        ...expectedArtworkMatches,
        ...expectedArtworkMatches,
        ...expectedArtworkMatches,
      ];

      expect(res).toEqual(expectedRes);
    });

    it("Should handle no entries with filter", async () => {
      jest.spyOn(service, "getArtworksReportEntries").mockResolvedValue([]);
      const res = await service.getAllArtworksMatches(mockedArtwork.id, {});

      expect(res).toEqual([]);
    });

    it("Should handle no entries without filter", async () => {
      jest.spyOn(service, "getArtworksReportEntries").mockResolvedValue([]);
      const res = await service.getAllArtworksMatches(mockedArtwork.id, {
        websiteCategory: WebsiteCategory.ART_PLATFORMS,
      });

      expect(res).toEqual([]);
    });
  });
});
