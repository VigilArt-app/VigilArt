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
  UploadedFile,
  UseInterceptors,
  BadRequestException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ArtworksService } from "./artworks.service";
import { StorageService } from "../storage/storage.service";
import {
  Artwork,
  ArtworkCreateDTO,
  ArtworkCreateManyDTO,
  ArtworkDTO,
  ArtworkRemoveManyDTO,
  ArtworkUpdateDTO,
  ArtworkCreateManyResponseDTO,
  ApiBatchPayload,
  ApiBatchPayloadDTO
} from "@vigilart/shared";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody, ApiParam } from "@nestjs/swagger";

@Controller("artworks")
export class ArtworksController {
  constructor(
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService
  ) {}

  @Post()
  @ApiEndpoint({
    summary: "Create a new artwork",
    success: {
      status: HttpStatus.CREATED,
      type: ArtworkDTO
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true
  })
  @ApiBody({ type: ArtworkCreateDTO })
  async create(@Body() createArtworkDto: ArtworkCreateDTO): Promise<Artwork> {
    return await this.artworksService.create(createArtworkDto);
  }

  @Post("batch")
  @ApiEndpoint({
    summary: "Create a batch of new artworks",
    success: {
      status: HttpStatus.CREATED,
      type: [ArtworkDTO]
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true
  })
  @ApiBody({ type: ArtworkCreateManyDTO })
  async createMany(
    @Body() createArtworksDto: ArtworkCreateManyDTO
  ): Promise<ArtworkCreateManyResponseDTO> {
    return await this.artworksService.createMany(createArtworksDto);
  }

  @Get()
  @ApiEndpoint({
    summary: "Retrieve all artworks",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO]
    },
    protected: true
  })
  async findAll(): Promise<Artwork[]> {
    return this.artworksService.findAll();
  }

  @Get("user/:id")
  @ApiEndpoint({
    summary: "Retrieve all artworks by user ID",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO]
    },
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async findAllPerUser(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<Artwork[]> {
    return this.artworksService.findAllPerUser(id);
  }

  @Get(":id")
  @ApiEndpoint({
    summary: "Retrieve an artwork by ID",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO]
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Artwork> {
    return this.artworksService.findOne(id);
  }

  @Patch(":id")
  @ApiEndpoint({
    summary: "Update an artwork by ID",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO]
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true
  })
  @ApiBody({ type: ArtworkUpdateDTO })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateArtworkDto: ArtworkUpdateDTO
  ): Promise<Artwork> {
    return this.artworksService.update(id, updateArtworkDto);
  }

  @Delete(":id")
  @ApiEndpoint({
    summary: "Delete an artwork by ID",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true
  })
  @ApiParam({ name: "id", type: String })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    const artwork = await this.artworksService.findOne(id);

    await this.storageService.deleteImage(artwork.storageKey);
    return this.artworksService.remove(id);
  }

  @Post("delete/batch")
  @ApiEndpoint({
    summary: "Delete artworks by ID",
    success: {
      status: HttpStatus.OK,
      type: [ApiBatchPayloadDTO]
    },
    protected: true
  })
  @ApiBody({ type: ArtworkRemoveManyDTO })
  async removeMany(
    @Body() { ids }: ArtworkRemoveManyDTO
  ): Promise<ApiBatchPayload> {
    const artworks = await this.artworksService.findMany(ids);
    const storageKeys = artworks.map((artwork) => artwork.storageKey);

    await this.storageService.deleteImages(storageKeys);
    return this.artworksService.removeMany(ids);
  }

  // Need to go through the backend to handle R2 upload via server-to-server connection (no CORS issues)
  // The backend endpoint accepts the file upload, uploads it to R2, and creates the artwork record in one step.
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiEndpoint({
    summary: "Upload an artwork file directly to R2 storage and create artwork record",
    success: {
      status: HttpStatus.CREATED,
      type: ArtworkDTO
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true
  })
  async uploadAndCreate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ): Promise<Artwork> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const {
      userId,
      originalFilename,
      contentType,
      sizeBytes,
      description,
      width,
      height
    } = body;

    if (!userId || !originalFilename || !width || !height) {
      throw new BadRequestException("Missing required fields: userId, originalFilename, width, height");
    }

    const storageKey = await this.storageService.uploadFile(
      file.buffer,
      originalFilename,
      "artworks"
    );

    const createArtworkDto: ArtworkCreateDTO = {
      userId,
      originalFilename,
      contentType: contentType || file.mimetype,
      sizeBytes: parseInt(sizeBytes) || file.size,
      storageKey,
      width: parseInt(width),
      height: parseInt(height),
      description: description || ""
    };

    return this.artworksService.create(createArtworkDto);
  }
}
