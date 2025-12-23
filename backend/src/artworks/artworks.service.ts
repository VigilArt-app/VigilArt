import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Artwork, ArtworkCreateDTO, ArtworkUpdateDTO } from "@vigilart/shared";

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(ArtworksService.name);

  async create({
    userId,
    imageUri,
    originalFilename,
    contentType,
    sizeBytes,
    description,
  }: ArtworkCreateDTO): Promise<Artwork> {
    const artworkData = {
      userId,
      imageUri,
      originalFilename,
      contentType,
      sizeBytes,
      description,
    };

    this.logger.log(`Creating new artwork ${imageUri} of user ${userId}`);
    try {
      return await this.prisma.artwork.create({
        data: artworkData,
      });
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new BadRequestException("User does not exist");
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

  async update(
    id: string,
    updateArtworkDto: ArtworkUpdateDTO
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
}
