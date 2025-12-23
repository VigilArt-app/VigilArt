import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ArtworksReport, MatchingPage } from "./interfaces";
import { GetArtworksMatchesDTO } from "@vigilart/shared";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("/user/:id")
  @HttpCode(HttpStatus.OK)
  async getArtworksReport(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReport> {
    return await this.reportsService.getArtworksReport(userId);
  }

  @Get("/matches/user/:id")
  @HttpCode(HttpStatus.OK)
  async getArtworksMatches(
    @Param("id", ParseUUIDPipe) userId: string,
    @Query() getArtworksMatchesDto: GetArtworksMatchesDTO
  ): Promise<MatchingPage[]> {
    return await this.reportsService.getAllArtworksMatches(
      userId,
      getArtworksMatchesDto
    );
  }

  @Get("/matches/artwork/:id")
  @HttpCode(HttpStatus.OK)
  async getArtworkMatches(
    @Param("id", ParseUUIDPipe) artworkId: string,
    @Query() getArtworksMatchesDto: GetArtworksMatchesDTO
  ): Promise<MatchingPage[]> {
    return await this.reportsService.getArtworkMatches(
      artworkId,
      getArtworksMatchesDto
    );
  }
}
