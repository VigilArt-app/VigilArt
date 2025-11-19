import { Test, TestingModule } from "@nestjs/testing";
import { VisionService } from "./vision.service";
import { ConfigModule } from "@nestjs/config";

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

  //To retrieve easily web detections result of an image, dont remove comments
  //   it("Should get web detections result of an image", async () => {
  //     const imageUri =
  //       "https://i.pinimg.com/736x/b0/42/f7/b042f7f4d3583298407291b0a8882fef.jpg";
  //     const result = await service.webDetection(imageUri);

  //     expect(result).toBeDefined();
  //   });
});
