import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import {
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_LOWERCASE,
  MIN_PASSWORD_NUMBERS,
  MIN_PASSWORD_SYMBOLS,
  MIN_PASSWORD_UPPERCASE,
} from "../../constants/User";

export const SignUpSchema = z.object({
  email: z
    .email({
      error: (e) =>
        e.input === undefined ? "Email is required." : undefined,
    })
    .transform((m) => m.toLowerCase()),
  password: z
    .string("Password is required.")
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    )
    .refine(
      (val) => (val.match(/[a-z]/g) || []).length >= MIN_PASSWORD_LOWERCASE,
      {
        message: `Password must contain at least ${MIN_PASSWORD_LOWERCASE} lowercase letter(s)`,
      }
    )
    .refine(
      (val) => (val.match(/[A-Z]/g) || []).length >= MIN_PASSWORD_UPPERCASE,
      {
        message: `Password must contain at least ${MIN_PASSWORD_UPPERCASE} uppercase letter(s)`,
      }
    )
    .refine(
      (val) => (val.match(/[0-9]/g) || []).length >= MIN_PASSWORD_NUMBERS,
      {
        message: `Password must contain at least ${MIN_PASSWORD_NUMBERS} number(s)`,
      }
    )
    .refine(
      (val) =>
        (val.match(/[^a-zA-Z0-9]/g) || []).length >= MIN_PASSWORD_SYMBOLS,
      {
        message: `Password must contain at least ${MIN_PASSWORD_SYMBOLS} symbol(s)`,
      }
    ),
  firstName: z
    .string({
      error: (e) =>
        e.input === undefined ? "First name is required." : undefined,
    })
    .min(1),
  lastName: z
    .string({
      error: (e) =>
        e.input === undefined ? "Last name is required." : undefined,
    })
    .min(1),
});
export class SignUpDTO extends createZodDto(SignUpSchema) {}
