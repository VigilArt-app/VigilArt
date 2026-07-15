import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import {
  Artwork,
  ArtworkCreateDTO,
  ArtworkCreateManyDTO,
  ArtworkUpdateDTO,
  ArtworkCreateManyResponseDTO,
  ApiBatchPayload,
  PaginatedResult
} from "@vigilart/shared";
import { assertResourceOwnership } from "../common/utils/ownership";
import { REPORT_STATS_KEY } from "../reports/reports.constants";

@Injectable()
export class ArtworksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private readonly logger = new Logger(ArtworksService.name);

  async create(artworkData: ArtworkCreateDTO): Promise<Artwork> {
    this.logger.log(
      `Creating new artwork ${artworkData.originalFilename} of user ${artworkData.userId}`
    );
    try {
      return await this.prisma.artwork.create({
        data: artworkData
      });
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new NotFoundException("User does not exist");
      }
      throw e;
    }
  }

  async createMany(
    artworksData: ArtworkCreateManyDTO
  ): Promise<ArtworkCreateManyResponseDTO> {
    this.logger.log("Creating new artworks");
    try {
      const res = await this.prisma.artwork.createManyAndReturn({
        data: artworksData
      });
      return {
        count: res.length,
        artworks: res.map((artwork) => ({
          id: artwork.id,
          userId: artwork.userId,
          originalFilename: artwork.originalFilename
        }))
      };
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new NotFoundException("User does not exist");
      }
      throw e;
    }
  }

  async findAll(): Promise<Artwork[]> {
    this.logger.log("Finding all artworks");
    return this.prisma.artwork.findMany();
  }

  async findAllPerUser(userId: string): Promise<Artwork[]> {
    this.logger.log(`Finding all artworks for user ${userId}`);
    return this.prisma.artwork.findMany({
      where: {
        userId
      }
    });
  }

  async findAllPerUserPaginated(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<PaginatedResult<Artwork>> {
    this.logger.log(`Finding artworks for user ${userId} (cursor=${cursor}, limit=${limit})`);
    const items = await this.prisma.artwork.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }]
    });
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }

  async findOne(userId: string, id: string): Promise<Artwork> {
    this.logger.log(`Finding artwork ${id}`);
    const artwork = await this.prisma.artwork.findUniqueOrThrow({
      where: {
        id
      }
    });

    return assertResourceOwnership(
      artwork,
      userId
    );
  }

  async findMany(userId: string, ids: string[]): Promise<Artwork[]> {
    this.logger.log(`Finding artworks ${ids.join(",")} for user ${userId}`);
    return this.prisma.artwork.findMany({
      where: {
        id: {
          in: ids
        },
        userId
      }
    });
  }

  async update(
    userId: string,
    id: string,
    updateArtworkDto: ArtworkUpdateDTO
  ): Promise<Artwork> {
    this.logger.log(`Updating artwork ${id}`);
    await this.findOne(userId, id);
    return this.prisma.artwork.update({
      where: {
        id
      },
      data: updateArtworkDto
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    this.logger.log(`Removing artwork ${id}`);
    await this.findOne(userId, id);
    await this.prisma.artwork.delete({
      where: {
        id
      }
    });
    await this.invalidateStatsCache(userId);
  }

  async removeMany(userId: string, ids: string[]): Promise<ApiBatchPayload> {
    this.logger.log(`Removing artworks ${ids.join(",")} for user ${userId}`);
    const result = await this.prisma.artwork.deleteMany({
      where: {
        id: {
          in: ids
        },
        userId
      }
    });
    await this.invalidateStatsCache(userId);
    return result;
  }

  // A report is a per-user scan run, so deleting artworks cascade-removes their
  // MatchingPages (changing a user's match counts) without touching the reports.
  // The scan runs are intentionally kept as history — including zero-match scans
  // — so we only invalidate the cached statistics to keep the counts accurate.
  private async invalidateStatsCache(userId: string): Promise<void> {
    await this.cacheManager.del(REPORT_STATS_KEY(userId));
  }
}
