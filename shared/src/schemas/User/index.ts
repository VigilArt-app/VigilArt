import { UserSchema as base } from "../../generated/zod";
import { dateTimeStringToDate } from "../../constants/DateTimeStringToDate";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";
import {
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_LOWERCASE,
  MIN_PASSWORD_NUMBERS,
  MIN_PASSWORD_SYMBOLS,
  MIN_PASSWORD_UPPERCASE,
} from "../../constants";

export const UserSchema = base.extend({
  email: z.email({
    error: (e) =>
      e.input === undefined ? "Email is required." : "Invalid email address",
  }),
  createdAt: dateTimeStringToDate,
});
export class UserDTO extends createZodDto(UserSchema) {}

export const UserGetSchema = UserSchema.omit({ password: true });
export class UserGetDTO extends createZodDto(UserGetSchema) {}

export const UserCreateSchema = UserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  email: z.email({
    error: (e) =>
      e.input === undefined ? "Email is required." : "Invalid email address",
  }),
  password: z
    .string({
      error: (e) =>
        e.input === undefined ? "Password is required." : undefined,
    })
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

export class UserCreateDTO extends createZodDto(UserCreateSchema) {}

export const UserUpdateSchema = UserGetSchema.omit({
  id: true,
  createdAt: true,
}).partial();
export class UserUpdateDTO extends createZodDto(UserUpdateSchema) {}

export * from "./Login";
export * from "./Signup";
