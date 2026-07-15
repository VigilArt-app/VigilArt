import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import { ArtworksService } from "./artworks.service";

describe("ArtworksService", () => {
  let service: ArtworksService;
  let prisma: {
    artwork: {
      findUniqueOrThrow: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let cache: { del: jest.Mock };

  beforeEach(async () => {
    prisma = {
      artwork: {
        findUniqueOrThrow: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      }
    };
    cache = { del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtworksService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache }
      ]
    }).compile();

    service = module.get(ArtworksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("remove", () => {
    it("invalidates the stats cache after deleting an artwork, keeping the reports", async () => {
      prisma.artwork.findUniqueOrThrow.mockResolvedValue({
        id: "art-1",
        userId: "user-id"
      });
      prisma.artwork.delete.mockResolvedValue({});

      await service.remove("user-id", "art-1");

      expect(prisma.artwork.delete).toHaveBeenCalledWith({
        where: { id: "art-1" }
      });
      expect(cache.del).toHaveBeenCalledWith(
        "reports:statistics:v2:user-id:all"
      );
    });
  });

  describe("removeMany", () => {
    it("invalidates the stats cache after a batch deletion", async () => {
      prisma.artwork.deleteMany.mockResolvedValue({ count: 2 });

      const res = await service.removeMany("user-id", ["a1", "a2"]);

      expect(res).toEqual({ count: 2 });
      expect(cache.del).toHaveBeenCalledWith(
        "reports:statistics:v2:user-id:all"
      );
    });
  });
});
