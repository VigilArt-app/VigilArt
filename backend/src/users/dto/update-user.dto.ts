import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  subscriptionTier?: string;
}
