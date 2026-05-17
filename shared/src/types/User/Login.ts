import { z } from "zod";
import { LoginSchema, AuthTokensSchema, AuthSessionSchema, AuthAccessTokenSchema } from "../../schemas/User";
import { UserGetSchema } from "../../schemas/User";

export type Login = z.infer<typeof LoginSchema>;

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export type AuthSessionResponse = z.infer<typeof AuthSessionSchema>;

export type AuthAccessToken = z.infer<typeof AuthAccessTokenSchema>;

export type AuthResponse = z.infer<typeof UserGetSchema> | AuthSessionResponse;
