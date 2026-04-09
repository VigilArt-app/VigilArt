import { z } from "zod";
import {
  UserSchema,
  UserGetSchema,
  UserCreateSchema,
  UserUpdateSchema,
} from "../../schemas/User";

export type User = z.infer<typeof UserSchema>;

export type UserGet = z.infer<typeof UserGetSchema>;

export type UserCreate = z.infer<typeof UserCreateSchema>;

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export * from "./Signup";
export * from "./Login";
