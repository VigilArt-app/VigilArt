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
  FilenamesDTO,
  PresignedUrls,
  PresignedUrlsDTO,
} from "@vigilart/shared";

@Controller("storage/artworks")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload-urls")
  @ApiEndpoint({
    summary: "Generate a list of pre-signed URLs to upload multiple artworks",
    success: {
      status: HttpStatus.OK,
      type: PresignedUrlsDTO,
    },
    protected: true,
  })
  @ApiBody({ type: FilenamesDTO })
  async getUploadUrls(
    @Body() { filenames }: FilenamesDTO
  ): Promise<PresignedUrls> {
    const uploadUrls = await Promise.all(
      filenames.map(async (filename: string) => {
        const uniqueKey = `${crypto.randomUUID()}-${filename}`;
        const presignedUrl = await this.storageService.getUploadUrl(uniqueKey);

        return [filename, presignedUrl];
      })
    );
    const uploadUrlsDict = Object.fromEntries(uploadUrls);
    return uploadUrlsDict;
  }

  @Post("download-urls")
  @ApiEndpoint({
    summary: "Generate a list of pre-signed URLs to download multiple artworks",
    success: {
      status: HttpStatus.OK,
      type: PresignedUrlsDTO,
    },
    protected: true,
  })
  @ApiBody({ type: FilenamesDTO })
  async getDownloadUrls(
    @Body() { filenames }: FilenamesDTO
  ): Promise<PresignedUrls> {
    const downloadUrls = await Promise.all(
      filenames.map(async (filename: string) => {
        const presignedUrl = await this.storageService.getDownloadUrl(filename);

        return [filename, presignedUrl];
      })
    );
    const downloadUrlsDict = Object.fromEntries(downloadUrls);
    return downloadUrlsDict;
  }
}
