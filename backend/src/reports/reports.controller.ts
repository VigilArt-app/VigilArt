import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import {
  ArtworksReport,
  ArtworksReportDTO,
  ArtworksReportGet,
  MatchingPage,
  MatchingPageDTO,
  MatchingPageGet
} from "@vigilart/shared";
import { GetArtworksMatchesDTO } from "@vigilart/shared";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiParam, ApiQuery } from "@nestjs/swagger";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("/user/:id")
  @ApiEndpoint({
    summary:
      "Returns a report listing detected matches for each artwork owned by a user",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportDTO
    },
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async getArtworksReport(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReportGet> {
    return await this.reportsService.getArtworksReport(userId);
  }

  @Get("/matches/user/:id")
  @ApiEndpoint({
    summary: "Returns all detected matches for artworks owned by a user.",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  @ApiQuery({ type: GetArtworksMatchesDTO })
  async getArtworksMatches(
    @Param("id", ParseUUIDPipe) userId: string,
    @Query() getArtworksMatchesDto: GetArtworksMatchesDTO
  ): Promise<MatchingPageGet[]> {
    return await this.reportsService.getAllArtworksMatches(
      userId,
      getArtworksMatchesDto
    );
  }

  @Get("/matches/artwork/:id")
  @ApiEndpoint({
    summary: "Returns all detected matches by artwork ID",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    errors: [HttpStatus.INTERNAL_SERVER_ERROR],
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  @ApiQuery({ type: GetArtworksMatchesDTO })
  async getArtworkMatches(
    @Param("id", ParseUUIDPipe) artworkId: string,
    @Query() getArtworksMatchesDto: GetArtworksMatchesDTO
  ): Promise<MatchingPageGet[]> {
    return await this.reportsService.getArtworkMatches(
      artworkId,
      getArtworksMatchesDto
    );
  }

  // ROUTE TO RETURN ARTWORKS REPORT GLOBAL STATISTICS
  // AND ANOTHER TO RETURN ARTWORKS REPORT ENTRY STATISTICS
  // REDO UNIT TESTS FOR STATISTICS
}
