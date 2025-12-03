import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ArtworksService } from "./artworks.service";
import { CreateArtworkDto } from "./dto/create-artwork.dto";
import { UpdateArtworkDto } from "./dto/update-artwork.dto";

@Controller("artworks")
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createArtworkDto: CreateArtworkDto) {
    return await this.artworksService.create(createArtworkDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return {
      artworks: await this.artworksService.findAll(),
    };
  }

  @Get("user/:id")
  @HttpCode(HttpStatus.OK)
  async findAllPerUser(@Param("id") id: string) {
    return {
      artworks: await this.artworksService.findAllPerUser(id),
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(@Param("id") id: string) {
    return await this.artworksService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async update(
    @Param("id") id: string,
    @Body() updateArtworkDto: UpdateArtworkDto
  ) {
    return await this.artworksService.update(id, updateArtworkDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    return await this.artworksService.remove(id);
  }
}
