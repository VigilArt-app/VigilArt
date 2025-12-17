import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { UserSchema } from "../User"

export const LoginSchema = z.object({
    email: z.email().transform((m) => m.toLowerCase()),
    password: z.string().min(1)
});
export class Login extends createZodDto(LoginSchema) {}

export const AuthResponseSchema = z.object({
    user: UserSchema.omit({ password: true }),
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string()
});
export class AuthResponse extends createZodDto(AuthResponseSchema) {}
