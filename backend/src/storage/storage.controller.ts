import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Delete,
  Param,
} from "@nestjs/common";
import { StorageService } from "./storage.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody, ApiParam } from "@nestjs/swagger";
import {
  DownloadUrlsGetDTO,
  UploadUrlsRequestDTO,
  UploadUrlsGetDTO,
  DownloadUrlsRequestDTO,
} from "@vigilart/shared";

@Controller("storage/artworks")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload-urls")
  @ApiEndpoint({
    summary: "Generate a list of pre-signed URLs to upload multiple artworks",
    success: {
      status: HttpStatus.OK,
      type: UploadUrlsGetDTO,
    },
    protected: true,
  })
  @ApiBody({ type: UploadUrlsRequestDTO })
  async getUploadUrls(
    @Body() { filenames }: UploadUrlsRequestDTO,
  ): Promise<UploadUrlsGetDTO> {
    return this.storageService.getUploadUrls(filenames);
  }

  @Post("download-urls")
  @ApiEndpoint({
    summary: "Generate a list of pre-signed URLs to download multiple artworks",
    success: {
      status: HttpStatus.OK,
      type: DownloadUrlsGetDTO,
    },
    protected: true,
  })
  @ApiBody({ type: DownloadUrlsRequestDTO })
  async getDownloadUrls(
    @Body() { storageKeys }: DownloadUrlsRequestDTO,
  ): Promise<DownloadUrlsGetDTO> {
    return this.storageService.getDownloadUrls(storageKeys);
  }
}
