import { z } from "zod";
import { LoginSchema, AuthResponseSchema } from "../../schemas/User";

export type Login = z.infer<typeof LoginSchema>;

export type AuthResponse = z.infer<typeof AuthResponseSchema>;