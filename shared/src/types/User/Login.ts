import { z } from "zod";
import { LoginSchema, AuthResponseSchema } from "../../schemas/User";

export type LoginDto = z.infer<typeof LoginSchema>;

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;