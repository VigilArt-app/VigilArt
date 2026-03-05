import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, HttpCode, Req } from "@nestjs/common";
import { ApiParam, ApiBody } from "@nestjs/swagger";
import { ApiEndpoint } from "../../common/decorators/api-endpoint.decorator";
import { DmcaProfileService } from "./profile.service";
import { DmcaProfileGetDTO, DmcaProfileCreateDTO, DmcaProfileUpdateDTO } from "@vigilart/shared";
import type { DmcaProfileGet } from "@vigilart/shared/types";
import type { AuthenticatedRequest } from "../../auth/auth";

@Controller("dmca/profile")
export class DmcaProfileController {
    constructor(private readonly profileService: DmcaProfileService) {}

    @Get("/")
    @ApiEndpoint({
        summary: "Get DMCA profile by user ID",
        success: {
            status: HttpStatus.OK,
            type: DmcaProfileGetDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    async getProfileByUserId(@Req() req: AuthenticatedRequest): Promise<DmcaProfileGet> {
        return this.profileService.findByUserId(req.user.id);
    }

    @Post("/")
    @HttpCode(HttpStatus.CREATED)
    @ApiEndpoint({
        summary: "Create DMCA profile for user",
        success: {
            status: HttpStatus.CREATED,
            type: DmcaProfileGetDTO
        },
        errors: [HttpStatus.CONFLICT],
        protected: true
    })
    @ApiBody({ type: DmcaProfileCreateDTO })
    async createProfile(
        @Req() req: AuthenticatedRequest,
        @Body() data: DmcaProfileCreateDTO
    ): Promise<DmcaProfileGet> {
        return this.profileService.create(req.user.id, data);
    }

    @Patch("/")
    @ApiEndpoint({
        summary: "Update DMCA profile",
        success: {
            status: HttpStatus.OK,
            type: DmcaProfileGetDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiBody({ type: DmcaProfileUpdateDTO })
    async updateProfile(
        @Req() req: AuthenticatedRequest,
        @Body() data: DmcaProfileUpdateDTO
    ): Promise<DmcaProfileGet> {
        return this.profileService.update(req.user.id, data);
    }

    @Delete("/")
    @ApiEndpoint({
        summary: "Delete DMCA profile",
        success: {
            status: HttpStatus.NO_CONTENT
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    async deleteProfile(@Req() req: AuthenticatedRequest): Promise<void> {
        return this.profileService.delete(req.user.id);
    }
}
