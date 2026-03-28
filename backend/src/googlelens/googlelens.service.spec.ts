import { Test, TestingModule } from "@nestjs/testing";
import { GoogleLensService } from "./googlelens.service";

describe("GoogleLensService", () => {
  let service: GoogleLensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleLensService]
    }).compile();

    service = module.get<GoogleLensService>(GoogleLensService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
