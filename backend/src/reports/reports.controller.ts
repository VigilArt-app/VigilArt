import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import {
  ArtworksReportDTO,
  ArtworksReport,
  ArtworksReportGet,
  MatchingPage,
  ArtworksReportGetDTO,
  MatchingPageDTO,
  ArtworksReportGlobalStatistics,
  ArtworksReportStatistics,
  ArtworksReportStatisticsDTO,
  ArtworksReportGlobalStatisticsDTO
} from "@vigilart/shared";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/auth";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post("user/:id")
  @ApiEndpoint({
    summary: "Create a new report for all artworks owned by a user",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportDTO
    },
    protected: true,
    errors: [HttpStatus.NOT_FOUND],
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  async generateArtworkReport(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReport> {
    return this.reportsService.generate(userId);
  }

  @Get("user/:id")
  @ApiEndpoint({
    summary: "Retrieve all reports of a user",
    success: {
      status: HttpStatus.OK,
      type: [ArtworksReportDTO]
    },
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  async getAllArtworksReportsByUser(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReport[]> {
    return this.reportsService.findAllPerUser(userId);
  }

  @Get("details/:id")
  @ApiEndpoint({
    summary: "Retrieve a report by ID",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportGetDTO
    },
    protected: true,
    errors: [HttpStatus.NOT_FOUND]
  })
  @ApiParam({ name: "id", type: String })
  async getArtworksReport(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<ArtworksReportGet> {
    return this.reportsService.findOne(id);
  }

  @Get("artwork/:artworkId/matches")
  @ApiEndpoint({
    summary: "Retrieve found matches of an artwork",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    protected: true,
    errors: [HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND]
  })
  @ApiParam({ name: "artworkId", type: String })
  @ApiQuery({
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report, by default it is set to the latest report"
  })
  @ApiQuery({
    name: "userId",
    required: true,
    type: String,
    description: "User id, temporary" //jwt session should be used instead
  })
  async getMatchesArtwork(
    @Param("artworkId", ParseUUIDPipe) artworkId: string,
    @Query("userId", ParseUUIDPipe) userId: string,
    @Query("reportId", new ParseUUIDPipe({ optional: true })) reportId?: string
  ): Promise<MatchingPage[]> {
    return this.reportsService.findMatchesByArtwork(
      artworkId,
      userId,
      reportId
    );
  }

  @Get("user/:userId/statistics")
  @ApiEndpoint({
    summary: "Get global statistics from a report",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportGlobalStatisticsDTO
    },
    protected: true,
    errors: [HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND]
  })
  @ApiParam({ name: "userId", type: String })
  @ApiQuery({
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report, by default it is set to the latest report"
  })
  async getGlobalStatistics(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("reportId", new ParseUUIDPipe({ optional: true })) reportId?: string
  ): Promise<ArtworksReportGlobalStatistics> {
    return this.reportsService.getGlobalStatistics(userId, reportId);
  }

  @Get("artwork/:artworkId/statistics")
  @ApiEndpoint({
    summary: "Get artwork statistics from a report",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportStatisticsDTO
    },
    protected: true,
    errors: [HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND]
  })
  @ApiParam({ name: "artworkId", type: String })
  @ApiQuery({
    name: "userId",
    required: true,
    type: String,
    description: "User id, temporary" //jwt session should be used instead
  })
  @ApiQuery({
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report, by default it is set to the latest report"
  })
  async getArtworkStatistics(
    @Param("artworkId", ParseUUIDPipe) artworkId: string,
    @Query("userId", ParseUUIDPipe) userId: string,
    @Query("reportId", new ParseUUIDPipe({ optional: true })) reportId?: string
  ): Promise<ArtworksReportStatistics> {
    return this.reportsService.getArtworkStatistics(
      artworkId,
      userId,
      reportId
    );
  }
}
