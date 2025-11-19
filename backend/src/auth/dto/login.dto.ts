import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
