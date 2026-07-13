import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
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
  ArtworksReportGlobalStatisticsDTO,
  StatisticsRange,
  ScanEnqueuedDTO,
  ScanStatusDTO,
  ScanEnqueued,
  ScanStatus
} from "@vigilart/shared";
import { WebsiteCategory } from "@vigilart/shared/server";
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

  @Post("user/:id/scan")
  @ApiEndpoint({
    summary: "Enqueue an async scan for all artworks owned by a user",
    success: {
      status: HttpStatus.OK,
      type: ScanEnqueuedDTO
    },
    protected: true,
    errors: [HttpStatus.NOT_FOUND, HttpStatus.FORBIDDEN],
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  async enqueueScan(
    @Param("id", ParseUUIDPipe) userId: string
  ): Promise<ScanEnqueued> {
    return this.reportsService.enqueueScan(userId);
  }

  @Get("user/:id/scan/:jobId")
  @ApiEndpoint({
    summary: "Get the status/progress of an async scan job",
    success: {
      status: HttpStatus.OK,
      type: ScanStatusDTO
    },
    protected: true,
    errors: [HttpStatus.NOT_FOUND],
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  @ApiParam({ name: "jobId", type: String })
  async getScanStatus(
    @Param("id", ParseUUIDPipe) userId: string,
    @Param("jobId") jobId: string
  ): Promise<ScanStatus> {
    return this.reportsService.getScanStatus(userId, jobId);
  }

  @Get("user/:id")
  @ApiEndpoint({
    summary: "Retrieve all reports of a user",
    success: {
      status: HttpStatus.OK,
      type: [ArtworksReportDTO]
    },
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }],
    errors: [HttpStatus.NOT_FOUND]
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
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<ArtworksReportGet> {
    return this.reportsService.findOne(req.user.id, id);
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
  async getMatchesArtwork(
    @Param("artworkId", ParseUUIDPipe) artworkId: string,
    @Req() req: AuthenticatedRequest,
    @Query("reportId", new ParseUUIDPipe({ optional: true })) reportId?: string
  ): Promise<MatchingPage[]> {
    return this.reportsService.findMatchesByArtwork(
      artworkId,
      req.user.id,
      reportId
    );
  }

  @Get("user/:userId/statistics")
  @ApiEndpoint({
    summary: "Get a user's global statistics (totals, per-category distribution, per-report timeline)",
    success: {
      status: HttpStatus.OK,
      type: ArtworksReportGlobalStatisticsDTO
    },
    protected: true,
    ownerships: [{ data: "userId", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "userId", type: String })
  @ApiQuery({
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report, by default it is set to the latest report"
  })
  @ApiQuery({
    name: "range",
    required: false,
    enum: ["all", "month"],
    description: "Time window for the totals/distribution (ignored when reportId is set). The timeline always spans all reports. Defaults to 'all'."
  })
  async getGlobalStatistics(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("reportId", new ParseUUIDPipe({ optional: true })) reportId?: string,
    @Query("range", new DefaultValuePipe("all")) range?: string
  ): Promise<ArtworksReportGlobalStatistics> {
    const statisticsRange: StatisticsRange = range === "month" ? "month" : "all";
    return this.reportsService.getGlobalStatistics(userId, reportId, statisticsRange);
  }

  @Get("user/:userId/matches")
  @ApiEndpoint({
    summary: "List a user's distinct matches in a given website category (statistics drill-down)",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    protected: true,
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN],
    ownerships: [{ data: "userId", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "userId", type: String })
  @ApiQuery({ name: "category", required: true, enum: WebsiteCategory })
  @ApiQuery({
    name: "range",
    required: false,
    enum: ["all", "month"],
    description: "Time window for the matches. Defaults to 'all'."
  })
  async getMatchesByCategory(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("category", new ParseEnumPipe(WebsiteCategory)) category: WebsiteCategory,
    @Query("range", new DefaultValuePipe("all")) range?: string
  ): Promise<MatchingPage[]> {
    const statisticsRange: StatisticsRange = range === "month" ? "month" : "all";
    return this.reportsService.findMatchesByCategory(userId, category, statisticsRange);
  }

  @Get("report/:reportId/matches")
  @ApiEndpoint({
    summary: "List the matches found in a single report (monthly-comparison drill-down)",
    success: {
      status: HttpStatus.OK,
      type: [MatchingPageDTO]
    },
    protected: true,
    errors: [HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND]
  })
  @ApiParam({ name: "reportId", type: String })
  async getMatchesByReport(
    @Req() req: AuthenticatedRequest,
    @Param("reportId", ParseUUIDPipe) reportId: string
  ): Promise<MatchingPage[]> {
    return this.reportsService.findMatchesByReport(req.user.id, reportId);
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
    name: "reportId",
    required: false,
    type: String,
    description: "Optional: get matches from a specific report, by default it is set to the latest report"
  })
  async getArtworkStatistics(
    @Param("artworkId", ParseUUIDPipe) artworkId: string,
    @Req() req: AuthenticatedRequest,
    @Query("reportId", new ParseUUIDPipe({ optional: true })) reportId?: string
  ): Promise<ArtworksReportStatistics> {
    return this.reportsService.getArtworkStatistics(
      artworkId,
      req.user.id,
      reportId
    );
  }
}
