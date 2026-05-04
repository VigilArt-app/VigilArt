import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, HttpCode, Req, ParseUUIDPipe } from "@nestjs/common";
import { ApiParam, ApiBody } from "@nestjs/swagger";
import { ApiEndpoint } from "../../common/decorators/api-endpoint.decorator";
import { DmcaProfileService } from "./profile.service";
import { DmcaProfileGetDTO, DmcaProfileCreateDTO, DmcaProfileUpdateDTO } from "@vigilart/shared";
import type { DmcaProfileGet } from "@vigilart/shared/types";

@Controller("dmca/profile")
export class DmcaProfileController {
    constructor(private readonly profileService: DmcaProfileService) {}

    @Get("/:userId")
    @ApiEndpoint({
        summary: "Get DMCA profile by user ID",
        success: {
            status: HttpStatus.OK,
            type: DmcaProfileGetDTO
        },
        errors: [HttpStatus.NOT_FOUND],
        ownerships: [{ data: "userId", userField: "id", type: "params" }],
        protected: true
    })
    @ApiParam({ name: "userId", type: String })
    async getProfileByUserId(@Param("userId", ParseUUIDPipe) userId: string): Promise<DmcaProfileGet> {
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
        ownerships: [{ data: "userId", userField: "id", type: "params" }],
        protected: true
    })
    @ApiBody({ type: DmcaProfileCreateDTO })
    @ApiParam({ name: "userId", type: String })
    async createProfile(
        @Param("userId", ParseUUIDPipe) userId: string,
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
        ownerships: [{ data: "userId", userField: "id", type: "params" }],
        protected: true
    })
    @ApiBody({ type: DmcaProfileUpdateDTO })
    @ApiParam({ name: "userId", type: String })
    async updateProfile(
        @Param("userId", ParseUUIDPipe) userId: string,
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
    async deleteProfile(@Param("userId", ParseUUIDPipe) userId: string): Promise<void> {
        return this.profileService.delete(userId);
    }
}
