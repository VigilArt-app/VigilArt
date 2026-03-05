import { Test } from "@nestjs/testing";
import { VisionService } from "./vision.service";
import { ConfigModule } from "@nestjs/config";
import { WebEntity, WebLabel, WebPage } from "./types";
import { WebsiteCategory } from "@vigilart/shared";
import fs from "fs";

jest.mock("@google-cloud/vision", () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => {
      return {
        close: jest.fn().mockResolvedValue(undefined),
        webDetection: jest.fn()
      };
    })
  };
});

describe("VisionService", () => {
  let service: VisionService;
  const inputFolder = "./src/vision/sample-inputs";
  const outputFolder = "./src/vision/expected-outputs";

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: false
        })
      ],
      providers: [VisionService]
    }).compile();

    service = module.get<VisionService>(VisionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const testArtworkProcessing = async (fileName: string) => {
    const inputFile = `${inputFolder}/${fileName}.json`;
    const expectedOutputFile = `${outputFolder}/${fileName}.json`;
    const webDetectionResult = JSON.parse(
      fs.readFileSync(inputFile).toString()
    );
    const expectedOutput = JSON.parse(
      fs.readFileSync(expectedOutputFile).toString()
    );
    jest
      .spyOn(service, "webDetection")
      .mockResolvedValue(webDetectionResult.result.webDetection);
    const result = await service.searchImage(webDetectionResult.inputImageUri);

    return { result, expectedOutput };
  };

  describe("getArtworkReportMetadata", () => {
    it("Should return null when both inputs are null/undefined", () => {
      expect(service.getArtworkReportMetadata(null, null)).toBeNull();
      expect(service.getArtworkReportMetadata(undefined, undefined)).toBeNull();
    });

    it("Should filter out labels without label property", () => {
      const labels: WebLabel[] = [
        { label: "Illustration", languageCode: "en" },
        { label: null },
        { label: "Youtube channel" }
      ];
      const result = service.getArtworkReportMetadata(labels, null);

      expect(result).toBeDefined();
      expect(result?.bestGuessLabels).toEqual([
        { label: "Illustration", languageCode: "en" },
        { label: "Youtube channel" }
      ]);
    });

    it("Should filter out entities without both score and description", () => {
      const entities: WebEntity[] = [
        { entityId: "id", description: "Drawing", score: 0.9 },
        { entityId: "id1", description: "Art", score: null },
        { entityId: "id2", description: null, score: 0.8 }
      ];
      const result = service.getArtworkReportMetadata(null, entities);

      expect(result).toBeDefined();
      expect(result?.webEntities).toEqual([
        { score: 0.9, description: "Drawing" }
      ]);
    });

    it("Should convert null languageCode to undefined", () => {
      const labels: WebLabel[] = [{ label: "Art", languageCode: null }];
      const result = service.getArtworkReportMetadata(labels, null);

      expect(result).toBeDefined();
      expect(result?.bestGuessLabels).toEqual([{ label: "Art" }]);
    });

    it("Should process both labels and entities together", () => {
      const labels: WebLabel[] = [{ label: "Art" }];
      const entities: WebEntity[] = [{ description: "Modern art", score: 0.9 }];
      const result = service.getArtworkReportMetadata(labels, entities);

      expect(result).toBeDefined();
      expect(result?.bestGuessLabels).toEqual([
        {
          label: "Art"
        }
      ]);
      expect(result?.webEntities).toEqual([
        { description: "Modern art", score: 0.9 }
      ]);
    });
  });

  describe("getArtworkReportMatchingPages", () => {
    it("Should return empty array for null/undefined input", () => {
      expect(service.getArtworkReportMatchingPages(null)).toEqual([]);
      expect(service.getArtworkReportMatchingPages(undefined)).toEqual([]);
    });

    it("Should filter out pages without URL", () => {
      const pages: WebPage[] = [
        {
          fullMatchingImages: null,
          partialMatchingImages: null,
          url: null,
          score: 0,
          pageTitle: "Illustration | Ultimate Pop Culture Wiki - Fandom"
        },
        {
          fullMatchingImages: [
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg",
              score: 0
            },
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s500x750/29dd115ee853ef59732d94a5b436daad3011bfe2.jpg",
              score: 0
            }
          ],
          partialMatchingImages: [],
          url: "https://emblask.tumblr.com/post/650058868223819776",
          score: 0,
          pageTitle: "Ayaka Suda illustration - Tumblr"
        }
      ];
      const result = service.getArtworkReportMatchingPages(pages);

      expect(result).toEqual([
        {
          url: "https://emblask.tumblr.com/post/650058868223819776",
          pageTitle: "Ayaka Suda illustration - Tumblr",
          category: WebsiteCategory.SOCIAL,
          websiteName: "tumblr.com",
          imageUrl:
            "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg"
        }
      ]);
    });

    it("Should filter out pages without any matching images", () => {
      const pages: WebPage[] = [
        {
          fullMatchingImages: [],
          partialMatchingImages: [],
          url: "https://www.pinterest.com/leland/illustration/",
          score: 0,
          pageTitle: "900+ Illustration ideas - Pinterest"
        },
        {
          fullMatchingImages: [
            {
              url: "https://i.pinimg.com/236x/b0/42/f7/b042f7f4d3583298407291b0a8882fef.jpg",
              score: 0
            }
          ],
          partialMatchingImages: [],
          url: "https://in.pinterest.com/rukminidubey/illustration-light-tone/",
          score: 0,
          pageTitle:
            "Discover 21 Illustration Light tone and cute drawings ideas"
        }
      ];
      const result = service.getArtworkReportMatchingPages(pages);

      expect(result).toEqual([
        {
          url: "https://in.pinterest.com/rukminidubey/illustration-light-tone/",
          pageTitle:
            "Discover 21 Illustration Light tone and cute drawings ideas",
          category: WebsiteCategory.SOCIAL,
          websiteName: "pinterest.com",
          imageUrl:
            "https://i.pinimg.com/236x/b0/42/f7/b042f7f4d3583298407291b0a8882fef.jpg"
        }
      ]);
    });

    it("Should process pages with full matching images", () => {
      const pages: WebPage[] = [
        {
          fullMatchingImages: [
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg",
              score: 0
            },
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s500x750/29dd115ee853ef59732d94a5b436daad3011bfe2.jpg",
              score: 0
            }
          ],
          partialMatchingImages: [],
          url: "https://emblask.tumblr.com/post/650058868223819776",
          score: 0,
          pageTitle: "Ayaka Suda illustration - Tumblr"
        },
        {
          fullMatchingImages: [
            {
              url: "https://pbs.twimg.com/media/FCnJBzCVcAIaOW0.jpg",
              score: 0
            }
          ],
          partialMatchingImages: [],
          url: "http://x.com/lingsilvy",
          score: 0,
          pageTitle: "SilvyLing (@LingSilvy) / Posts / X"
        }
      ];
      const result = service.getArtworkReportMatchingPages(pages);

      expect(result).toEqual([
        {
          url: "https://emblask.tumblr.com/post/650058868223819776",
          pageTitle: "Ayaka Suda illustration - Tumblr",
          category: WebsiteCategory.SOCIAL,
          websiteName: "tumblr.com",
          imageUrl:
            "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg"
        },
        {
          url: "http://x.com/lingsilvy",
          pageTitle: "SilvyLing (@LingSilvy) / Posts / X",
          category: WebsiteCategory.SOCIAL,
          websiteName: "x.com",
          imageUrl: "https://pbs.twimg.com/media/FCnJBzCVcAIaOW0.jpg"
        }
      ]);
    });

    it("Should process pages with partial matching images", () => {
      const pages: WebPage[] = [
        {
          fullMatchingImages: [],
          partialMatchingImages: [
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s500x750/29dd115ee853ef59732d94a5b436daad3011bfe2.jpg",
              score: 0
            },
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg",
              score: 0
            }
          ],
          url: "https://emblask.tumblr.com/post/650058868223819776",
          score: 0,
          pageTitle: "Ayaka Suda illustration - Tumblr"
        },
        {
          fullMatchingImages: [],
          partialMatchingImages: [],
          url: "http://x.com/lingsilvy",
          score: 0,
          pageTitle: "SilvyLing (@LingSilvy) / Posts / X"
        }
      ];
      const result = service.getArtworkReportMatchingPages(pages);

      expect(result).toEqual([
        {
          url: "https://emblask.tumblr.com/post/650058868223819776",
          pageTitle: "Ayaka Suda illustration - Tumblr",
          category: WebsiteCategory.SOCIAL,
          websiteName: "tumblr.com",
          imageUrl:
            "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s500x750/29dd115ee853ef59732d94a5b436daad3011bfe2.jpg"
        }
      ]);
    });

    it("Should handle missing optional fields (pageTitle, imageUrl)", () => {
      const pages: WebPage[] = [
        {
          fullMatchingImages: [
            {
              url: "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s500x750/29dd115ee853ef59732d94a5b436daad3011bfe2.jpg",
              score: 0
            }
          ],
          partialMatchingImages: [],
          url: "https://x.com/sparrows89",
          score: 0
        }
      ];
      const result = service.getArtworkReportMatchingPages(pages);

      expect(result).toEqual([
        {
          url: "https://x.com/sparrows89",
          category: WebsiteCategory.SOCIAL,
          websiteName: "x.com",
          pageTitle: undefined,
          imageUrl:
            "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s500x750/29dd115ee853ef59732d94a5b436daad3011bfe2.jpg"
        }
      ]);
    });
  });

  describe("searchImage", () => {
    it("Should return null when webDetection returns null/undefined", async () => {
      jest.spyOn(service, "webDetection").mockResolvedValue(null);
      expect(await service.searchImage(Buffer.from(""))).toBeNull();

      jest.spyOn(service, "webDetection").mockResolvedValue(undefined);
      expect(await service.searchImage(Buffer.from(""))).toBeNull();
    });

    it("Should return null when pagesWithMatchingImages is null/undefined", async () => {
      jest.spyOn(service, "webDetection").mockResolvedValue({
        bestGuessLabels: [{ label: "Art" }],
        pagesWithMatchingImages: null
      });
      expect(await service.searchImage(Buffer.from(""))).toBeNull();

      jest.spyOn(service, "webDetection").mockResolvedValue({
        bestGuessLabels: [{ label: "Art" }]
      });
      expect(await service.searchImage(Buffer.from(""))).toBeNull();
    });

    it("Should process valid response correctly", async () => {
      jest.spyOn(service, "webDetection").mockResolvedValue({
        bestGuessLabels: [{ label: "Art" }],
        webEntities: [{ description: "Modern", score: 0.9 }],
        pagesWithMatchingImages: [
          {
            fullMatchingImages: [],
            partialMatchingImages: [],
            url: "https://ultimatepopculture.fandom.com/wiki/Illustration",
            score: 0,
            pageTitle: "Illustration | Ultimate Pop Culture Wiki - Fandom"
          },
          {
            fullMatchingImages: [
              {
                url: "https://pbs.twimg.com/media/FCnJBzCVcAIaOW0.jpg",
                score: 0
              }
            ],
            partialMatchingImages: [],
            url: "http://x.com/lingsilvy",
            score: 0,
            pageTitle: "SilvyLing (@LingSilvy) / Posts / X"
          },
          {
            fullMatchingImages: [
              {
                url: "https://pbs.twimg.com/media/E0XD3lQVgAEUCwr.jpg",
                score: 0
              }
            ],
            partialMatchingImages: [],
            url: "https://x.com/sparrows89",
            score: 0,
            pageTitle: "Madi's Mayhem (@sparrows89) / Posts / X - Twitter"
          }
        ]
      });
      const result = await service.searchImage(Buffer.from(""));

      expect(result).toEqual({
        metadata: {
          bestGuessLabels: [{ label: "Art" }],
          webEntities: [{ description: "Modern", score: 0.9 }]
        },
        matchingPages: [
          {
            url: "http://x.com/lingsilvy",
            pageTitle: "SilvyLing (@LingSilvy) / Posts / X",
            category: WebsiteCategory.SOCIAL,
            websiteName: "x.com",
            imageUrl: "https://pbs.twimg.com/media/FCnJBzCVcAIaOW0.jpg"
          },
          {
            url: "https://x.com/sparrows89",
            pageTitle: "Madi's Mayhem (@sparrows89) / Posts / X - Twitter",
            category: WebsiteCategory.SOCIAL,
            websiteName: "x.com",
            imageUrl: "https://pbs.twimg.com/media/E0XD3lQVgAEUCwr.jpg"
          }
        ]
      });
    });
  });

  describe("Real API Response Processing", () => {
    it("Should correctly process artwork by ayaka-suda", async () => {
      const { result, expectedOutput } =
        await testArtworkProcessing("artwork_ayaka-suda");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("metadata");
      expect(result).toHaveProperty("matchingPages");
      expect(result?.metadata?.bestGuessLabels).toEqual(
        expectedOutput.metadata.bestGuessLabels
      );
      expect(result?.metadata?.webEntities).toEqual(
        expectedOutput.metadata.webEntities
      );

      expect(result?.matchingPages).toEqual(expectedOutput.matchingPages);
    });

    it("Should correctly process 'it's a small world' artwork by kevandram", async () => {
      const { result, expectedOutput } = await testArtworkProcessing(
        "its-a-small-world_kevandram"
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("metadata");
      expect(result).toHaveProperty("matchingPages");
      expect(result?.metadata?.bestGuessLabels).toEqual(
        expectedOutput.metadata.bestGuessLabels
      );
      expect(result?.metadata?.webEntities).toEqual(
        expectedOutput.metadata.webEntities
      );
      expect(result?.matchingPages).toEqual(expectedOutput.matchingPages);
    });
  });

  describe("Integration Edge Cases", () => {
    it("Should return null when webDetection returns no pagesWithMatchingImages field", async () => {
      jest.spyOn(service, "webDetection").mockResolvedValue({
        fullMatchingImages: []
      });
      const result = await service.searchImage(Buffer.from(""));

      expect(result).toBeNull();
    });

    it("Should handle API response with empty arrays", async () => {
      jest.spyOn(service, "webDetection").mockResolvedValue({
        bestGuessLabels: [],
        webEntities: [],
        pagesWithMatchingImages: []
      });
      const result = await service.searchImage(Buffer.from(""));

      expect(result).toBeDefined();
      expect(result?.metadata).toEqual({
        bestGuessLabels: [],
        webEntities: []
      });
      expect(result?.matchingPages).toEqual([]);
    });
  });
});
