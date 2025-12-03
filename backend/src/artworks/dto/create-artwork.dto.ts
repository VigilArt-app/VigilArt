import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateArtworkDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  imageUri!: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  originalFilename?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  contentType?: string;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  sizeBytes?: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;
}
