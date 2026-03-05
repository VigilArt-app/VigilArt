import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Req
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import {
  ArtworksReport,
  ArtworksReportDTO,
  MatchingPage,
  MatchingPageDTO
} from "@vigilart/shared";
import { GetArtworksMatchesDTO } from "@vigilart/shared";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/auth";

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
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  async getArtworksReport(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReport> {
    return this.reportsService.getArtworksReport(userId);
  }

  @Get("/matches/user/:id")
  @ApiEndpoint({
    summary: "Returns all detected matches for artworks owned by a user.",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  @ApiQuery({ type: GetArtworksMatchesDTO })
  async getArtworksMatches(
    @Param("id", ParseUUIDPipe) userId: string,
    @Query() getArtworksMatchesDto: GetArtworksMatchesDTO
  ): Promise<MatchingPage[]> {
    return this.reportsService.getAllArtworksMatches(
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
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) artworkId: string,
    @Query() getArtworksMatchesDto: GetArtworksMatchesDTO
  ): Promise<MatchingPage[]> {
    return this.reportsService.getArtworkMatches(
      req.user.id,
      artworkId,
      getArtworksMatchesDto
    );
  }
}
