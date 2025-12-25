import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { UserSchema } from "../User";

export const LoginSchema = z.object({
  email: z
    .email({
      error: (e) => (e.input === undefined ? "Email is required." : undefined),
    })
    .transform((m) => m.toLowerCase()),
  password: z
    .string({
      error: (e) =>
        e.input === undefined ? "Password is required." : undefined,
    })
    .min(1),
});
export class LoginDTO extends createZodDto(LoginSchema) {}

export const AuthResponseSchema = z.object({
  user: UserSchema.omit({ password: true }),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});
export class AuthResponseDTO extends createZodDto(AuthResponseSchema) {}
