import { Test, TestingModule } from "@nestjs/testing";
import { VisionService } from "./vision.service";
import { ConfigModule } from "@nestjs/config";
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
    const result = await service.searchImage(Buffer.from(""));

    return { result, expectedOutput };
  };

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
