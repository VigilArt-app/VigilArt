import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ArtworksService } from "./artworks.service";
import { ArtworkCreateDTO, ArtworkUpdateDTO } from "@vigilart/shared";

@Controller("artworks")
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createArtworkDto: ArtworkCreateDTO) {
    return await this.artworksService.create(createArtworkDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.artworksService.findAll();
  }

  @Get("user/:id")
  @HttpCode(HttpStatus.OK)
  async findAllPerUser(@Param("id", ParseUUIDPipe) id: string) {
    return await this.artworksService.findAllPerUser(id);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.artworksService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateArtworkDto: ArtworkUpdateDTO
  ) {
    return await this.artworksService.update(id, updateArtworkDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return await this.artworksService.remove(id);
  }
}
