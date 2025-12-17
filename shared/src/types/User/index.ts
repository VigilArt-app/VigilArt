import { z } from "zod";
import { UserSchema, UserGetSchema, UserCreateSchema, UserUpdateSchema } from "../../schemas/User";

export type UserDto = z.infer<typeof UserSchema>;

export type UserGetDto = z.infer<typeof UserGetSchema>;

export type UserCreateDto = z.infer<typeof UserCreateSchema>;

export type UserUpdateDto = z.infer<typeof UserUpdateSchema>;

export * from "./Signup";
export * from "./Login";
