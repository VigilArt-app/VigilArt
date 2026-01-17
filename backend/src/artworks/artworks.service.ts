import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  Artwork,
  ArtworkCreateDTO,
  ArtworkCreateManyDTO,
  ArtworkUpdateDTO,
  BatchPayload,
} from "@vigilart/shared";

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(ArtworksService.name);

  async create({
    userId,
    originalFilename,
    ...artworkData
  }: ArtworkCreateDTO): Promise<Artwork> {
    this.logger.log(
      `Creating new artwork ${originalFilename} of user ${userId}`,
    );
    try {
      return await this.prisma.artwork.create({
        data: { userId, originalFilename, ...artworkData },
      });
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new NotFoundException("User does not exist");
      }
      throw e;
    }
  }

  async createMany(artworksData: ArtworkCreateManyDTO): Promise<BatchPayload> {
    this.logger.log("Creating new artworks");
    try {
      return await this.prisma.artwork.createMany({
        data: artworksData,
      });
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
        userId,
      },
    });
  }

  async findOne(id: string): Promise<Artwork> {
    try {
      this.logger.log(`Finding artwork ${id}`);
      return await this.prisma.artwork.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
  }

  async findMany(ids: string[]): Promise<Artwork[]> {
    this.logger.log(`Finding artworks ${ids.join(",")}`);
    return await this.prisma.artwork.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async update(
    id: string,
    updateArtworkDto: ArtworkUpdateDTO,
  ): Promise<Artwork> {
    this.logger.log(`Updating artwork ${id}`);
    try {
      return await this.prisma.artwork.update({
        where: {
          id,
        },
        data: updateArtworkDto,
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing artwork ${id}`);
    try {
      await this.prisma.artwork.delete({
        where: {
          id,
        },
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
  }

  async removeMany(ids: string[]): Promise<void> {
    this.logger.log(`Removing artworks ${ids.join(",")}`);
    await this.prisma.artwork.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
