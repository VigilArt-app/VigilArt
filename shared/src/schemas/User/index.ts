import { UserSchema as base } from "../../generated/zod";
import { dateTimeStringToDate } from "../../constants/DateTimeStringToDate";
import { createZodDto } from "nestjs-zod/dto";

export const UserSchema = base.extend({ createdAt: dateTimeStringToDate });
export class User extends createZodDto(UserSchema) {}

export const UserGetSchema = UserSchema.omit({ password: true });
export class UserGet extends createZodDto(UserGetSchema) {}

export const UserCreateSchema = UserSchema.pick({
    email: true,
    password: true,
    firstName: true,
    lastName: true
});
export class UserCreate extends createZodDto(UserCreateSchema) {}

export const UserUpdateSchema = UserGetSchema.omit({
    id: true,
    createdAt: true,
}).partial();
export class UserUpdate extends createZodDto(UserUpdateSchema) {}

export * from "./Login";
export * from "./Signup";
