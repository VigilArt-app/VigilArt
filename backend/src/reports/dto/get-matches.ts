import { IsOptional, IsString } from "class-validator";

export class GetArtworksMatchesDto {
  @IsOptional()
  @IsString()
  websiteCategory?: string;
}
