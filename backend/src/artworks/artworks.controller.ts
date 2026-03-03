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
import type { AuthenticatedRequest } from "../auth/auth";

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
    protected: true,
    ownerships: [{ data: "userId", userField: "id", type: "body" }]
  })
  @ApiBody({ type: ArtworkCreateDTO })
  async create(@Body() createArtworkDto: ArtworkCreateDTO): Promise<Artwork> {
    return this.artworksService.create(createArtworkDto);
  }

  @Post("batch")
  @ApiEndpoint({
    summary: "Create a batch of new artworks",
    success: {
      status: HttpStatus.CREATED,
      type: [ArtworkDTO]
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
    ownerships: [{ data: "[].userId", userField: "id", type: "body" }]
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
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
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
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<Artwork> {
    return this.artworksService.findOne(req.user.id, id);
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
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateArtworkDto: ArtworkUpdateDTO
  ): Promise<Artwork> {
    return this.artworksService.update(req.user.id, id, updateArtworkDto);
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
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<void> {
    const artwork = await this.artworksService.findOne(req.user.id, id);

    await this.storageService.deleteImage(artwork.storageKey);
    return this.artworksService.remove(req.user.id, id);
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
    @Req() req: AuthenticatedRequest,
    @Body() { ids }: ArtworkRemoveManyDTO
  ): Promise<ApiBatchPayload> {
    const artworks = await this.artworksService.findMany(req.user.id, ids);
    const storageKeys = artworks.map((artwork) => artwork.storageKey);

    await this.storageService.deleteImages(storageKeys);
    return this.artworksService.removeMany(req.user.id, ids);
  }

  // Faire unit tests pour storage service ?
}
