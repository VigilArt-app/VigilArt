import { Test, TestingModule } from "@nestjs/testing";
import { StorageService } from "./storage.service";
import { ConfigModule } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        close: jest.fn().mockResolvedValue(undefined),
        send: jest.fn(),
      };
    }),
    GetObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

jest.mock("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: jest
      .fn()
      .mockResolvedValue("presignedUrl"),
  };
});

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: false,
          envFilePath: "../.env",
        }),
      ],
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getUploadUrl", () => {
    it("Should return presigned urls for upload - supported file extensions", async () => {
      const res = await service.getUploadUrl("grey_haired_woman.jpg");
      const res2 = await service.getUploadUrl("grey_haired_woman.jpeg");
      const res3 = await service.getUploadUrl("grey_haired_woman.png");

      expect(res).toEqual({
        storageKey: expect.any(String),
        presignedUrl: "presignedUrl",
      });
      expect(res2).toEqual({
        storageKey: expect.any(String),
        presignedUrl: "presignedUrl",
      });
      expect(res3).toEqual({
        storageKey: expect.any(String),
        presignedUrl: "presignedUrl",
      });
    });

    it("Shouldn't return presigned url for upload - insupported file extension", async () => {
      const upload = service.getUploadUrl("grey_haired_woman.exe");

      await expect(upload).rejects.toThrow(
        new BadRequestException("Only JPEG and PNG formats are supported."),
      );
    });
  });

  describe("getUploadUrls", () => {
    it("Should return an array of presigned urls for upload - supported file extensions", async () => {
      const res = await service.getUploadUrls([
        "grey haired woman.jpg",
        "flower.jpeg",
      ]);

      expect(res).toEqual({
        "grey-haired-woman.jpg": {
          storageKey: expect.any(String),
          presignedUrl: "presignedUrl",
        },
        "flower.jpeg": {
          storageKey: expect.any(String),
          presignedUrl: "presignedUrl",
        },
      });
    });

    it("Shouldn't return an array of presigned urls for upload - insupported file extension", async () => {
      const upload = service.getUploadUrls([
        "grey_haired_woman.jpg",
        "flower.webp",
      ]);

      await expect(upload).rejects.toThrow(
        new BadRequestException("Only JPEG and PNG formats are supported."),
      );
    });
  });
});
