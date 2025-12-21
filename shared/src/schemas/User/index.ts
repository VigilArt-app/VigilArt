import { UserSchema as base } from "../../generated/zod";
import { dateTimeStringToDate } from "../../constants/DateTimeStringToDate";
import { createZodDto } from "nestjs-zod";

export const UserSchema = base.extend({
    createdAt: dateTimeStringToDate,
    updatedAt: dateTimeStringToDate
});
export class UserDTO extends createZodDto(UserSchema) {}

export const UserGetSchema = UserSchema.omit({ password: true });
export class UserGetDTO extends createZodDto(UserGetSchema) {}

export const UserCreateSchema = UserSchema.pick({
    email: true,
    password: true,
    firstName: true,
    lastName: true
});
export class UserCreateDTO extends createZodDto(UserCreateSchema) {}

export const UserUpdateSchema = UserGetSchema.omit({
    id: true,
    createdAt: true,
}).partial();
export class UserUpdateDTO extends createZodDto(UserUpdateSchema) {}

export * from "./Login";
export * from "./Signup";
