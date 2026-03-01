import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, HttpCode } from "@nestjs/common";
import { ApiParam, ApiBody } from "@nestjs/swagger";
import { ApiEndpoint } from "../../common/decorators/api-endpoint.decorator";
import { DmcaProfileService } from "./profile.service";
import { DmcaProfileGetDTO, DmcaProfileCreateDTO, DmcaProfileUpdateDTO } from "@vigilart/shared";
import type { DmcaProfileGet } from "@vigilart/shared/types";

@Controller("dmca/profile")
export class DmcaProfileController {
    constructor(private readonly profileService: DmcaProfileService) {}

    @Get("/")
    @ApiEndpoint({
        summary: "Get all DMCA profiles",
        success: {
            status: HttpStatus.OK,
            type: [DmcaProfileGetDTO]
        },
        protected: true
    })
    async getAllProfiles(): Promise<DmcaProfileGet[]> {
        return this.profileService.findAll();
    }

    @Get("/:userId")
    @ApiEndpoint({
        summary: "Get DMCA profile by user ID",
        success: {
            status: HttpStatus.OK,
            type: DmcaProfileGetDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "userId", type: String })
    async getProfileByUserId(@Param("userId") userId: string): Promise<DmcaProfileGet> {
        return this.profileService.findByUserId(userId);
    }

    @Post("/:userId")
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
    @ApiParam({ name: "userId", type: String })
    @ApiBody({ type: DmcaProfileCreateDTO })
    async createProfile(
        @Param("userId") userId: string,
        @Body() data: DmcaProfileCreateDTO
    ): Promise<DmcaProfileGet> {
        return this.profileService.create(userId, data);
    }

    @Patch("/:userId")
    @ApiEndpoint({
        summary: "Update DMCA profile",
        success: {
            status: HttpStatus.OK,
            type: DmcaProfileGetDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "userId", type: String })
    @ApiBody({ type: DmcaProfileUpdateDTO })
    async updateProfile(
        @Param("userId") userId: string,
        @Body() data: DmcaProfileUpdateDTO
    ): Promise<DmcaProfileGet> {
        return this.profileService.update(userId, data);
    }

    @Delete("/:userId")
    @ApiEndpoint({
        summary: "Delete DMCA profile",
        success: {
            status: HttpStatus.NO_CONTENT
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true
    })
    @ApiParam({ name: "userId", type: String })
    async deleteProfile(@Param("userId") userId: string): Promise<void> {
        return this.profileService.delete(userId);
    }
}
