import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  Artwork,
  ArtworkCreateDTO,
  ArtworkCreateManyDTO,
  ArtworkUpdateDTO,
  ArtworkCreateManyResponseDTO,
  ApiBatchPayload
} from "@vigilart/shared";

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(userId: string, id: string): Promise<Artwork> {
    try {
      this.logger.log(`Finding artwork ${id}`);
      return await this.prisma.artwork.findUniqueOrThrow({
        where: {
          id,
          userId
        }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
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
    try {
      return await this.prisma.artwork.update({
        where: {
          id,
          userId
        },
        data: updateArtworkDto
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    this.logger.log(`Removing artwork ${id}`);
    try {
      await this.prisma.artwork.delete({
        where: {
          id,
          userId
        }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
  }

  async removeMany(userId: string, ids: string[]): Promise<ApiBatchPayload> {
    this.logger.log(`Removing artworks ${ids.join(",")} for user ${userId}`);
    return this.prisma.artwork.deleteMany({
      where: {
        id: {
          in: ids
        },
        userId
      }
    });
  }
}
