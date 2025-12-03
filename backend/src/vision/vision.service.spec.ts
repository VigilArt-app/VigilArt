import { Test, TestingModule } from "@nestjs/testing";
import { VisionService } from "./vision.service";
import { ConfigModule } from "@nestjs/config";
import fs from "fs";
import { IArtworkIndividualReport } from "./interfaces";

describe("VisionService", () => {
  let service: VisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [VisionService],
    }).compile();

    service = module.get<VisionService>(VisionService);
  });

  it("Should be defined", () => {
    expect(service).toBeDefined();
  });

  it("Should return individual report for each artwork", async () => {
    const inputFolder = "./src/vision/sample-inputs";
    const outputFolder = "./src/vision/expected-outputs";
    const inputFiles = ["artwork_ayaka-suda", "its-a-small-world_kevandram"];

    for (const inputName of inputFiles) {
      const inputFile = `${inputFolder}/${inputName}.json`;
      const expectedOutputFile = `${outputFolder}/${inputName}.json`;
      const webDetectionResult = JSON.parse(
        fs.readFileSync(inputFile).toString()
      );
      const expectedOutput = JSON.parse(
        fs.readFileSync(expectedOutputFile).toString()
      );
      jest
        .spyOn(service, "webDetection")
        .mockReturnValue(webDetectionResult.result.webDetection);

      const res: IArtworkIndividualReport | null =
        await service.getArtworkIndividualReport(
          webDetectionResult.inputImageUri
        );

      if (!res) {
        fail("Report shouldn't be null");
      }
      if (!res.statistics) {
        fail("Report statistics shouldn't be null");
      }
      if (!res.metadata) {
        fail("Report metadata result shouldn't be null");
      }
      expect(res.detectionDate).toEqual(expect.any(String));
      expect(res.statistics).toEqual(expectedOutput.statistics);
      expect(res.statistics.totalMatches).toEqual(
        expectedOutput.statistics.totalMatches
      );

      expect(res.metadata.bestGuessLabels).toEqual(
        expectedOutput.metadata.bestGuessLabels
      );
      expect(res.metadata.webEntities).toEqual(
        expectedOutput.metadata.webEntities
      );
      expect(res.matchingPages).toEqual(expectedOutput.matchingPages);
    }
  });
});
