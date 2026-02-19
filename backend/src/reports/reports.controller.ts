import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query
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

@Controller("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Post("user/:id")
  @ApiEndpoint({
    summary: "Create a new report for all artworks owned by a user",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportDTO
    },
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async generateArtworkReport(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReport> {
    return await this.reportsService.generate(userId);
  }

  @Get("user/:id")
  @ApiEndpoint({
    summary: "Retrieve all reports of a user",
    success: {
      status: HttpStatus.OK,
      type: [ArtworksReportDTO]
    },
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async getAllArtworksReportsByUser(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ArtworksReport[]> {
    return await this.reportsService.findAllPerUser(userId);
  }

  @Get(":id")
  @ApiEndpoint({
    summary: "Retreive a report by ID",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportGetDTO
    },
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async getArtworksReport(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<ArtworksReportGet> {
    return await this.reportsService.findOne(id);
  }

  @Get("artwork/:artworkId/matches")
  @ApiEndpoint({
    summary: "Retreive found matches of an artwork",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    protected: true
  })
  @ApiParam({ name: "artworkId", type: String })
  @ApiQuery({
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report"
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
    @Query("reportId") reportId?: string
  ): Promise<MatchingPage[]> {
    return await this.reportsService.findManyByArtwork(
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
    protected: true
  })
  @ApiParam({ name: "userId", type: String })
  @ApiQuery({
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report"
  })
  async getGlobalStatistics(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("reportId") reportId?: string
  ): Promise<ArtworksReportGlobalStatistics> {
    return await this.reportsService.getGlobalStatistics(userId, reportId);
  }

  @Get("artwork/:artworkId/statistics")
  @ApiEndpoint({
    summary: "Get artwork statistics from a report",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportStatisticsDTO
    },
    protected: true
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
    description: "Optional: get matches from a specific report"
  })
  async getArtworkStatistics(
    @Param("artworkId", ParseUUIDPipe) artworkId: string,
    @Query("userId", ParseUUIDPipe) userId: string,
    @Query("reportId") reportId?: string
  ): Promise<ArtworksReportStatistics> {
    return await this.reportsService.getArtworkStatistics(
      artworkId,
      userId,
      reportId
    );
  }

}
