import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateArtworkDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;
}
