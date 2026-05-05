import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { UserGetSchema } from "./User";

export const LoginSchema = z.object({
  email: z
    .email({
      error: (e) =>
        e.input === undefined ? "Email is required." : undefined,
    })
    .transform((m) => m.toLowerCase()),
  password: z.string("Password is required.").min(1),
});
export class LoginDTO extends createZodDto(LoginSchema) {}

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string()
});
export class AuthTokensDTO extends createZodDto(AuthTokensSchema) {}

export const AuthSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserGetSchema
});
export class AuthSessionDTO extends createZodDto(AuthSessionSchema) {}

export const AuthAccessTokenSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.string()
});
export class AuthAccessTokenDTO extends createZodDto(AuthAccessTokenSchema) {}
