import { Controller, Get, HttpStatus, Param } from "@nestjs/common";
import { DmcaPlatformGetDTO } from "@vigilart/shared/schemas";
import { ApiParam } from "@nestjs/swagger";
import { ApiEndpoint } from "../../common/decorators/api-endpoint.decorator";
import { DmcaPlatformService } from "./platform.service";
import type { DmcaPlatformGet } from "@vigilart/shared/types";

@Controller("dmca/platform")
export class DmcaPlatformController {
    constructor(private readonly platformService: DmcaPlatformService) {}

    @Get("/")
    @ApiEndpoint({
        summary: "Retrieve all DMCA platforms",
        success: {
            status: HttpStatus.OK,
            type: [DmcaPlatformGetDTO],
        },
        protected: true,
    })
    async getPlatforms(): Promise<DmcaPlatformGet[]> {
        return this.platformService.findAll();
    }

    @Get("/:slug")
    @ApiEndpoint({
        summary: "Retrieve a DMCA platform by slug",
        success: {
            status: HttpStatus.OK,
            type: DmcaPlatformGetDTO,
        },
        errors: [HttpStatus.NOT_FOUND],
        protected: true,
    })
    @ApiParam({ name: "slug", type: String })
    async getPlatformBySlug(@Param("slug") slug: string): Promise<DmcaPlatformGet> {
        return this.platformService.findBySlug(slug);
    }
}
