import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req
} from "@nestjs/common";
import { ApiParam, ApiBody } from "@nestjs/swagger";
import { ApiEndpoint } from "../../common/decorators/api-endpoint.decorator";
import { DmcaNoticeService } from "./notice.service";
import {
    DmcaNoticeGetDTO,
    DmcaNoticeCreateDTO,
    DmcaNoticeUpdateDTO,
    DmcaNoticeGeneratedContentDTO
} from "@vigilart/shared/schemas";
import type { DmcaNoticeGet } from "@vigilart/shared/types";
import { DmcaStatus } from "@vigilart/shared";
import type { AuthenticatedRequest } from "../../auth/auth";

@Controller("dmca/notice")
export class DmcaNoticeController {
    constructor(private readonly noticeService: DmcaNoticeService) {}

    @Get("/")
    @ApiEndpoint({
        summary: "Get all DMCA notices",
        success: {
            status: HttpStatus.OK,
            type: [DmcaNoticeGetDTO]
        },
        protected: true
    })
    async getAllNotices(): Promise<DmcaNoticeGet[]> {
        return this.noticeService.findAll();
    }

    @Get("/user/:id")
    @ApiEndpoint({
        summary: "Get all DMCA notices for a user",
        success: {
            status: HttpStatus.OK,
            type: [DmcaNoticeGetDTO]
        },
        errors: [HttpStatus.NOT_FOUND],
        ownerships: [{ data: "id", userField: "id", type: "params" }],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async getNoticesByUserId(@Param("id", ParseUUIDPipe) userId: string): Promise<DmcaNoticeGet[]> {
        return this.noticeService.findByUserId(userId);
    }

    @Get("/:id")
    @ApiEndpoint({
        summary: "Get a DMCA notice by ID",
        success: {
            status: HttpStatus.OK,
            type: DmcaNoticeGetDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async getNoticeById(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ): Promise<DmcaNoticeGet> {
        return this.noticeService.findById(req.user.id, id);
    }

    @Post("/")
    @ApiEndpoint({
        summary: "Create a new DMCA notice",
        success: {
            status: HttpStatus.CREATED,
            type: DmcaNoticeGetDTO
        },
        errors: [HttpStatus.BAD_REQUEST],
        ownerships: [{ data: "userId", userField: "id", type: "body" }],
        protected: true
    })
    @ApiBody({ type: DmcaNoticeCreateDTO })
    async createNotice(
        @Body() data: DmcaNoticeCreateDTO
    ): Promise<DmcaNoticeGet> {
        return this.noticeService.create(data);
    }

    @Patch("/:id")
    @ApiEndpoint({
        summary: "Update a DMCA notice",
        success: {
            status: HttpStatus.OK,
            type: DmcaNoticeGetDTO
        },
        errors: [HttpStatus.NOT_FOUND, HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST],
        protected: true,
        ownerships: [{ data: "userId", userField: "id", type: "body" }]
    })
    @ApiParam({ name: "id", type: String })
    @ApiBody({ type: DmcaNoticeUpdateDTO })
    async updateNotice(
        @Param("id") id: string,
        @Body() data: DmcaNoticeUpdateDTO
    ): Promise<DmcaNoticeGet> {
        return this.noticeService.update(id, data);
    }

    @Patch("/:id/status/:status")
    @ApiEndpoint({
        summary: "Update the status of a DMCA notice",
        success: {
            status: HttpStatus.OK,
            type: DmcaNoticeGetDTO
        },
        errors: [HttpStatus.NOT_FOUND, HttpStatus.CONFLICT],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    @ApiParam({ name: "status", enum: DmcaStatus })
    async updateNoticeStatus(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("status") status: DmcaStatus
    ): Promise<DmcaNoticeGet> {
        return this.noticeService.updateStatus(req.user.id, id, status);
    }

    @Delete("/:id")
    @ApiEndpoint({
        summary: "Delete a DMCA notice",
        success: {
            status: HttpStatus.NO_CONTENT
        },
        errors: [HttpStatus.NOT_FOUND, HttpStatus.CONFLICT],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async deleteNotice(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ): Promise<void> {
        return this.noticeService.delete(req.user.id, id);
    }

    @Post("/:id/generate")
    @ApiEndpoint({
        summary: "Generate an email and a pdf based on the notice content",
        success: {
            status: HttpStatus.OK,
            type: DmcaNoticeGeneratedContentDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async generate(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ): Promise<DmcaNoticeGeneratedContentDTO> {
        return this.noticeService.generate(req.user.id, id);
    }
}
