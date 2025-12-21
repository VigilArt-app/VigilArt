import { IsOptional, IsString } from "class-validator";
import { SubscriptionTier } from "@vigilart/shared/enums";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  subscriptionTier?: SubscriptionTier;
}
