import { Controller, HttpStatus, Post, Body, Req } from "@nestjs/common";
import { ArtworkLimitService } from "../artworks/artwork-limit.service";
import type { AuthenticatedRequest } from "../auth/auth";
import { StorageService } from "./storage.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody } from "@nestjs/swagger";
import {
  DownloadUrlsGetDTO,
  UploadUrlsRequestDTO,
  UploadUrlsGetDTO,
  DownloadUrlsRequestDTO
} from "@vigilart/shared";

@Controller("storage/artworks")
export class StorageController {
  constructor(private readonly storageService: StorageService, private readonly artworkLimit: ArtworkLimitService) {}

  @Post("upload-urls")
  @ApiEndpoint({
    summary: "Generate a list of pre-signed URLs to upload multiple artworks",
    success: {
      status: HttpStatus.OK,
      type: UploadUrlsGetDTO
    },
    protected: true
  })
  @ApiBody({ type: UploadUrlsRequestDTO })
  async getUploadUrls(
    @Body() { filenames, prefix }: UploadUrlsRequestDTO,
    @Req() req: AuthenticatedRequest
  ): Promise<UploadUrlsGetDTO> {
    if (prefix === "artworks") await this.artworkLimit.assertCapacity(req.user.id, filenames.length);
    return this.storageService.getUploadUrls(filenames, prefix);
  }

  @Post("download-urls")
  @ApiEndpoint({
    summary: "Generate a list of pre-signed URLs to download multiple artworks",
    success: {
      status: HttpStatus.OK,
      type: DownloadUrlsGetDTO
    },
    protected: true
  })
  @ApiBody({ type: DownloadUrlsRequestDTO })
  async getDownloadUrls(
    @Body() { storageKeys }: DownloadUrlsRequestDTO
  ): Promise<DownloadUrlsGetDTO> {
    return this.storageService.getDownloadUrls(storageKeys);
  }
}
