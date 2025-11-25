import { IsOptional, IsString } from "class-validator";
import { SubscriptionTier } from "src/generated/prisma";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  subscriptionTier?: SubscriptionTier;
}
