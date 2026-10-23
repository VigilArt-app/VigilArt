import { Test, TestingModule } from "@nestjs/testing";
import { StorageService } from "./storage.service";
import { ConfigModule } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        close: jest.fn().mockResolvedValue(undefined),
        send: mockSend
      };
    }),
    GetObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    DeleteObjectsCommand: jest.fn().mockImplementation((input) => ({ input }))
  };
});

jest.mock("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue("presignedUrl")
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
          envFilePath: "../.env"
        })
      ],
      providers: [StorageService]
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
      const res = await service.getUploadUrl("grey_haired_woman.jpg", "artworks");
      const res2 = await service.getUploadUrl("grey_haired_woman.jpeg", "artworks");
      const res3 = await service.getUploadUrl("grey_haired_woman.png", "artworks");

      expect(res).toEqual({
        storageKey: expect.any(String),
        presignedUrl: "presignedUrl"
      });
      expect(res2).toEqual({
        storageKey: expect.any(String),
        presignedUrl: "presignedUrl"
      });
      expect(res3).toEqual({
        storageKey: expect.any(String),
        presignedUrl: "presignedUrl"
      });
    });

    it("Shouldn't return presigned url for upload - unsupported file extension", async () => {
      const upload = service.getUploadUrl("grey_haired_woman.exe", "artworks");

      await expect(upload).rejects.toThrow(
        new BadRequestException("Only JPEG and PNG formats are supported.")
      );
    });
  });

  describe("getUploadUrls", () => {
    it("Should return an array of presigned urls for upload - supported file extensions", async () => {
      const res = await service.getUploadUrls([
        "grey haired woman.jpg",
        "flower.jpeg"
      ], "artworks");

      expect(res).toEqual({
        "grey haired woman.jpg": {
          storageKey: expect.any(String),
          presignedUrl: "presignedUrl"
        },
        "flower.jpeg": {
          storageKey: expect.any(String),
          presignedUrl: "presignedUrl"
        }
      });
    });

    it("Shouldn't return an array of presigned urls for upload - insupported file extension", async () => {
      const upload = service.getUploadUrls([
        "grey_haired_woman.jpg",
        "flower.webp"
      ], "artworks");

      await expect(upload).rejects.toThrow(
        new BadRequestException("Only JPEG and PNG formats are supported.")
      );
    });
  });

  describe("deleteImages", () => {
    const deletedKeys = () =>
      mockSend.mock.calls.map(([command]) =>
        command.input.Delete.Objects.map(({ Key }: { Key: string }) => Key)
      );

    it("Should split deletions into requests of at most 1000 keys", async () => {
      mockSend.mockResolvedValue({});
      const keys = Array.from({ length: 2500 }, (_, i) => `artworks/a${i}.jpg`);

      await service.deleteImages(keys);

      expect(deletedKeys().map((batch) => batch.length)).toEqual([1000, 1000, 500]);
      expect(deletedKeys().flat()).toEqual(keys);
    });

    it("Should not call R2 when there is nothing to delete", async () => {
      await service.deleteImages([]);

      expect(mockSend).not.toHaveBeenCalled();
    });

    // R2 answers 200 and lists per-key failures in Errors instead of throwing.
    it("Should fail when R2 reports a key it could not delete", async () => {
      mockSend.mockResolvedValue({
        Errors: [{ Key: "artworks/a.jpg", Code: "InternalError", Message: "We encountered an internal error." }]
      });

      await expect(service.deleteImages(["artworks/a.jpg", "artworks/b.jpg"])).rejects.toThrow(
        "artworks/a.jpg (InternalError: We encountered an internal error.)"
      );
    });

    it("Should still delete the next batches when a key of the first one fails", async () => {
      mockSend
        .mockResolvedValueOnce({
          Errors: [{ Key: "artworks/a0.jpg", Code: "AccessDenied", Message: "Access Denied" }]
        })
        .mockResolvedValue({});
      const keys = Array.from({ length: 2500 }, (_, i) => `artworks/a${i}.jpg`);

      await expect(service.deleteImages(keys)).rejects.toThrow(
        "artworks/a0.jpg (AccessDenied: Access Denied)"
      );
      expect(deletedKeys().flat()).toEqual(keys);
    });
  });
});
