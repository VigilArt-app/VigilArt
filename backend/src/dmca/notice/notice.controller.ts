import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    HttpCode
} from "@nestjs/common";
import { ApiParam, ApiBody } from "@nestjs/swagger";
import { ApiEndpoint } from "../../common/decorators/api-endpoint.decorator";
import { DmcaNoticeService } from "./notice.service";
import {
    DmcaNoticeGetDTO,
    DmcaNoticeCreateDTO,
    DmcaNoticeUpdateDTO,
    DmcaNoticeEmailResponseDTO,
    DmcaNoticeFileResponseDTO
} from "@vigilart/shared/schemas";
import type { DmcaNoticeGet } from "@vigilart/shared/types";
import { DmcaStatus } from "@vigilart/shared";

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

    @Get("/user/:userId")
    @ApiEndpoint({
        summary: "Get all DMCA notices for a user",
        success: {
            status: HttpStatus.OK,
            type: [DmcaNoticeGetDTO]
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "userId", type: String })
    async getNoticesByUserId(@Param("userId") userId: string): Promise<DmcaNoticeGet[]> {
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
    async getNoticeById(@Param("id") id: string): Promise<DmcaNoticeGet> {
        return this.noticeService.findById(id);
    }

    @Post("/")
    @HttpCode(HttpStatus.CREATED)
    @ApiEndpoint({
        summary: "Create a new DMCA notice",
        success: {
            status: HttpStatus.CREATED,
            type: DmcaNoticeGetDTO
        },
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
        errors: [HttpStatus.NOT_FOUND],
        protected: true
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
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    @ApiParam({ name: "status", enum: DmcaStatus })
    async updateNoticeStatus(
        @Param("id") id: string,
        @Param("status") status: DmcaStatus
    ): Promise<DmcaNoticeGet> {
        return this.noticeService.updateStatus(id, status);
    }

    @Delete("/:id")
    @ApiEndpoint({
        summary: "Delete a DMCA notice",
        success: {
            status: HttpStatus.NO_CONTENT
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async deleteNotice(@Param("id") id: string): Promise<void> {
        return this.noticeService.delete(id);
    }

    @Post("/:id/generate")
    @ApiEndpoint({
        summary: "Generate a PDF for a DMCA notice",
        success: {
            status: HttpStatus.OK,
            type: DmcaNoticeFileResponseDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async generateNoticePdf(@Param("id") id: string): Promise<DmcaNoticeFileResponseDTO> {
        return this.noticeService.generatePdf(id);
    }

    @Post("/:id/email")
    @ApiEndpoint({
        summary: "Get DMCA notice email content",
        success: {
            status: HttpStatus.OK,
            type: DmcaNoticeEmailResponseDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "id", type: String })
    async getNoticeEmail(@Param("id") id: string): Promise<DmcaNoticeEmailResponseDTO> {
        return this.noticeService.getNoticeEmail(id);
    }
}
