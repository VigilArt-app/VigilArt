import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import {
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_LOWERCASE,
  MIN_PASSWORD_NUMBERS,
  MIN_PASSWORD_SYMBOLS,
  MIN_PASSWORD_UPPERCASE,
} from "./constants";
import { Transform } from "class-transformer";

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @IsStrongPassword({
    minLength: MIN_PASSWORD_LENGTH,
    minNumbers: MIN_PASSWORD_NUMBERS,
    minUppercase: MIN_PASSWORD_UPPERCASE,
    minLowercase: MIN_PASSWORD_LOWERCASE,
    minSymbols: MIN_PASSWORD_SYMBOLS,
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
