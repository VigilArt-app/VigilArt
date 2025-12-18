import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateArtworkDto } from "./dto/create-artwork.dto";
import { UpdateArtworkDto } from "./dto/update-artwork.dto";
import { PrismaService } from "../prisma/prisma.service";

import { randomUuid } from "testcontainers";
import { Artwork } from "src/generated/prisma/client";

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
  }: CreateArtworkDto): Promise<Artwork | undefined> {
    const userData = {
      id: randomUuid(),
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
        data: userData,
      });
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new BadRequestException("User does not exist");
      }
      throw new InternalServerErrorException("Error when creating artwork");
    }
  }

  async findAll(): Promise<Artwork[]> {
    this.logger.log("Finding all artworks");
    try {
      return await this.prisma.artwork.findMany();
    } catch (_) {
      throw new InternalServerErrorException(
        "Error when retrieving all artworks"
      );
    }
  }

  async findAllPerUser(userId: string): Promise<Artwork[]> {
    this.logger.log(`Finding all artworks for user ${userId}`);
    try {
      return await this.prisma.artwork.findMany({
        where: {
          userId,
        },
      });
    } catch (_) {
      throw new InternalServerErrorException(
        `Error when retrieving all artworks for user ${userId}`
      );
    }
  }

  async findOne(id: string): Promise<Artwork | null> {
    this.logger.log(`Finding artwork ${id}`);
    return await this.prisma.artwork.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    updateArtworkDto: UpdateArtworkDto
  ): Promise<Artwork | undefined> {
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
        throw new NotFoundException(`Artwork ${id} not found`);
      }
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
        throw new NotFoundException(`Artwork ${id} not found`);
      }
    }
  }
}
