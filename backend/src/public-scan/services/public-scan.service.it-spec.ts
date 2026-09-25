import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  NotFoundException,
  PayloadTooLargeException
} from "@nestjs/common";
import { getQueueToken } from "@nestjs/bullmq";
import { PublicScanService } from "./public-scan.service";
import { PublicScanBudgetService } from "./public-scan-budget.service";
import { StorageService } from "../../storage/storage.service";
import {
  PUBLIC_SCAN_QUEUE,
  PUBLIC_SCAN_MAX_FILE_BYTES,
  PUBLIC_SCAN_STORAGE_PREFIX
} from "../public-scan.constants";

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const pngUpload = (): Express.Multer.File =>
  ({
    buffer: Buffer.concat([PNG_HEADER, Buffer.alloc(128)]),
    size: 136,
    originalname: "artwork.png"
  }) as Express.Multer.File;

describe("PublicScanService", () => {
  let service: PublicScanService;
  let storage: {
    uploadBuffer: jest.Mock;
    deleteImage: jest.Mock;
    getDownloadUrl: jest.Mock;
  };
  let budget: { release: jest.Mock; remainingToday: jest.Mock };
  let queue: { add: jest.Mock; getJob: jest.Mock };

  beforeEach(async () => {
    storage = {
      uploadBuffer: jest.fn().mockResolvedValue("https://dl.example"),
      deleteImage: jest.fn().mockResolvedValue(undefined),
      getDownloadUrl: jest.fn()
    };
    budget = {
      release: jest.fn().mockResolvedValue(undefined),
      remainingToday: jest.fn()
    };
    queue = { add: jest.fn(), getJob: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicScanService,
        { provide: StorageService, useValue: storage },
        { provide: PublicScanBudgetService, useValue: budget },
        { provide: getQueueToken(PUBLIC_SCAN_QUEUE), useValue: queue }
      ]
    }).compile();

    service = module.get(PublicScanService);
  });

  describe("start", () => {
    it("Should upload under a generated key and return the job id", async () => {
      queue.add.mockResolvedValue({ id: "job-1" });

      await expect(service.start(pngUpload())).resolves.toEqual({
        scanId: "job-1"
      });

      const [, storageKey, contentType] = storage.uploadBuffer.mock.calls[0];
      expect(storageKey.startsWith(`${PUBLIC_SCAN_STORAGE_PREFIX}/`)).toBe(true);
      expect(contentType).toBe("image/png");
    });

    // BullMQ numbers jobs sequentially when no id is given, and the status
    // route has no owner to check against, so "2" would read the result of
    // whoever scanned just before you.
    it("Should give the job an unguessable id", async () => {
      queue.add.mockResolvedValue({ id: "job-1" });

      await service.start(pngUpload());

      const jobId = queue.add.mock.calls[0][2].jobId;
      expect(jobId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    // The key must never derive from the upload's filename: "../artworks/x.png"
    // would otherwise write outside the public-scan prefix.
    it("Should ignore the client-supplied filename when building the key", async () => {
      queue.add.mockResolvedValue({ id: "job-1" });
      const hostile = {
        ...pngUpload(),
        originalname: "../artworks/steal.png"
      } as Express.Multer.File;

      await service.start(hostile);

      const [, storageKey] = storage.uploadBuffer.mock.calls[0];
      expect(storageKey).not.toContain("..");
      expect(storageKey).not.toContain("steal");
    });

    // Each of these must fail before anything is uploaded or queued, so no
    // paid search happens. Handing the reservation back is the interceptor's
    // job and is covered in its own spec.
    it("Should reject a request with no file", async () => {
      await expect(service.start(undefined)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(storage.uploadBuffer).not.toHaveBeenCalled();
    });

    it("Should reject bytes that are not a JPEG or PNG", async () => {
      const renamedExecutable = {
        buffer: Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02]),
        size: 5,
        originalname: "artwork.png"
      } as Express.Multer.File;

      await expect(service.start(renamedExecutable)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(storage.uploadBuffer).not.toHaveBeenCalled();
    });

    it("Should reject a file over the size limit", async () => {
      const huge = {
        ...pngUpload(),
        size: PUBLIC_SCAN_MAX_FILE_BYTES + 1
      } as Express.Multer.File;

      await expect(service.start(huge)).rejects.toBeInstanceOf(
        PayloadTooLargeException
      );
      expect(storage.uploadBuffer).not.toHaveBeenCalled();
    });

    // The image is already in the bucket at this point and nothing will ever
    // scan it, so it has to be removed here rather than waiting for the
    // lifecycle rule.
    it("Should delete the uploaded image when enqueueing fails", async () => {
      queue.add.mockRejectedValue(new Error("redis down"));

      await expect(service.start(pngUpload())).rejects.toThrow("redis down");
      expect(storage.deleteImage).toHaveBeenCalledTimes(1);
    });

    it("Should not queue anything when the upload to storage fails", async () => {
      storage.uploadBuffer.mockRejectedValue(new Error("r2 down"));

      await expect(service.start(pngUpload())).rejects.toThrow("r2 down");
      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe("getStatus", () => {
    const job = (state: string, extra: Record<string, unknown> = {}) => ({
      getState: jest.fn().mockResolvedValue(state),
      ...extra
    });

    it("Should return the result once the scan is done", async () => {
      const result = { totalMatches: 17, matches: [], categories: [] };
      queue.getJob.mockResolvedValue(
        job("completed", { returnvalue: result })
      );

      await expect(service.getStatus("job-1")).resolves.toEqual({
        scanId: "job-1",
        state: "done",
        result,
        error: null
      });
    });

    it("Should report a running scan without a result", async () => {
      queue.getJob.mockResolvedValue(job("active", { returnvalue: null }));

      const status = await service.getStatus("job-1");
      expect(status.state).toBe("running");
      expect(status.result).toBeNull();
    });

    it("Should map every queued state the client cannot act on to pending", async () => {
      for (const state of ["waiting", "delayed", "prioritized"]) {
        queue.getJob.mockResolvedValue(job(state));
        expect((await service.getStatus("job-1")).state).toBe("pending");
      }
    });

    it("Should surface the failure reason", async () => {
      queue.getJob.mockResolvedValue(
        job("failed", { failedReason: "lens timeout" })
      );

      const status = await service.getStatus("job-1");
      expect(status.state).toBe("failed");
      expect(status.error).toBe("lens timeout");
    });

    it("Should 404 for an unknown scan id", async () => {
      queue.getJob.mockResolvedValue(null);

      await expect(service.getStatus("nope")).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    // The job can be evicted between getJob and getState; treating that as
    // "pending" would leave the client polling a job that no longer exists.
    it("Should 404 when the job is evicted mid-read", async () => {
      queue.getJob.mockResolvedValue(job("unknown"));

      await expect(service.getStatus("job-1")).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });

  describe("getAllowance", () => {
    it("Should report what is left of today's shared budget", async () => {
      budget.remainingToday.mockResolvedValue(3);

      await expect(service.getAllowance()).resolves.toEqual({
        remainingToday: 3
      });
    });
  });
});
