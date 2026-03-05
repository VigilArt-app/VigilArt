import { z } from "zod";
import { LoginSchema, AuthTokensSchema } from "../../schemas/User";

export type Login = z.infer<typeof LoginSchema>;

export type AuthTokens = z.infer<typeof AuthTokensSchema>;
