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
} from "@nestjs/common";
import { ArtworksService } from "./artworks.service";
import { StorageService } from "../storage/storage.service";
import {
  Artwork,
  ArtworkCreateDTO,
  ArtworkDTO,
  ArtworkUpdateDTO,
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
      type: ArtworkDTO,
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiBody({ type: ArtworkCreateDTO })
  async create(@Body() createArtworkDto: ArtworkCreateDTO): Promise<Artwork> {
    return await this.artworksService.create(createArtworkDto);
  }

  @Get()
  @ApiEndpoint({
    summary: "Retrieve all artworks",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO],
    },
    protected: true,
  })
  async findAll(): Promise<Artwork[]> {
    return this.artworksService.findAll();
  }

  @Get("user/:id")
  @ApiEndpoint({
    summary: "Retrieve all artworks by user ID",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO],
    },
    protected: true,
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
      type: [ArtworkDTO],
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Artwork> {
    return this.artworksService.findOne(id);
  }

  @Patch(":id")
  @ApiEndpoint({
    summary: "Retrieve an artwork by ID",
    success: {
      status: HttpStatus.OK,
      type: [ArtworkDTO],
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
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
      status: HttpStatus.NO_CONTENT,
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    const artwork = await this.artworksService.findOne(id);

    this.storageService.deleteImage(artwork.originalFilename);
    this.artworksService.remove(id);
  }

  // Faire route pour supprimer plusieurs artworks
  // Update le e2e test pour DELETE /artworks/:id voir localstack community image
  // Faire unit tests pour storage service  et e2e test pour la route "supprimer plusieurs artworks"
  // Update la seed database et update le module Artworks + les e2e tests
  // vu que imageUri a été retiré du model prisma
  // Retourner presigned urls dans les GET artworks
}
