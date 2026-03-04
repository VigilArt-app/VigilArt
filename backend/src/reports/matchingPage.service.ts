import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  ApiBatchPayload,
  MatchingPage,
  MatchingPageCreateDTO,
  MatchingPageCreateManyDTO,
  MatchingPageCreateManyResponseDTO,
  MatchingPageUpdateDTO
} from "@vigilart/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MatchingPagesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(MatchingPagesService.name);

  async create(matchData: MatchingPageCreateDTO): Promise<MatchingPage> {
    this.logger.log(
      `Creating new matching page for artwork ${matchData.artworkId}`
    );
    try {
      return await this.prisma.matchingPage.create({
        data: matchData
      });
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new NotFoundException("Artwork not found");
      }
      throw e;
    }
  }

  async createMany(
    matchesData: MatchingPageCreateManyDTO
  ): Promise<MatchingPageCreateManyResponseDTO> {
    this.logger.log("Creating new matching pages");
    try {
      const res = await this.prisma.matchingPage.createManyAndReturn({
        data: matchesData,
        skipDuplicates: true
      });
      return {
        count: res.length,
        matchingPages: res.map((matchingPage) => ({
          id: matchingPage.id,
          artworkId: matchingPage.artworkId,
          imageUrl: matchingPage.imageUrl
        }))
      };
    } catch (e: any) {
      if (e.code === "P2003") {
        throw new NotFoundException("Artwork does not exist");
      }
      throw e;
    }
  }

  async findAll(): Promise<MatchingPage[]> {
    this.logger.log("Finding all matching pages");
    return this.prisma.matchingPage.findMany();
  }

  async findOne(id: string): Promise<MatchingPage> {
    try {
      this.logger.log(`Finding matching page ${id}`);
      return await this.prisma.matchingPage.findUniqueOrThrow({
        where: {
          id
        }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Matching page not found");
      }
      throw e;
    }
  }

  async findByUrl(
    url: string,
    artworkId: string
  ): Promise<MatchingPage | null> {
    this.logger.log(`Finding match with url ${url} for artwork ${artworkId}`);
    return await this.prisma.matchingPage.findUnique({
      where: {
        url_artworkId: {
          url: url,
          artworkId: artworkId
        }
      }
    });
  }

  async findMany(ids: string[]): Promise<MatchingPage[]> {
    this.logger.log(`Finding matching pages ${ids.join(",")}`);
    return this.prisma.matchingPage.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  async update(
    id: string,
    updateMatchingPageDto: MatchingPageUpdateDTO
  ): Promise<MatchingPage> {
    this.logger.log(`Updating matching page ${id}`);
    try {
      return await this.prisma.matchingPage.update({
        where: {
          id
        },
        data: updateMatchingPageDto
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Matching page not found");
      }
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing matching page ${id}`);
    try {
      await this.prisma.matchingPage.delete({
        where: {
          id
        }
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException("Matching page not found");
      }
      throw e;
    }
  }

  async removeMany(ids: string[]): Promise<ApiBatchPayload> {
    this.logger.log(`Removing matching pages ${ids.join(",")}`);
    return await this.prisma.matchingPage.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }
}
