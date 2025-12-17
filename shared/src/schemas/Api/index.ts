import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const ApiResponseSchema = z.object({
    success: z.boolean(),
    statusCode: z.number().int().min(100).max(599),
    message: z.string().min(1).nullable()
});
export class ApiResponseClass extends createZodDto(ApiResponseSchema) {};

export const ApiSuccessSchema = ApiResponseSchema.extend({
    success: z.literal(true).meta({ example: true }),
    statusCode: z.literal(200).meta({ example: 200 }),
    data: z.any().nullable()
});
export class ApiSuccessClass extends createZodDto(ApiSuccessSchema) {}

export const ApiCreatedSchema = ApiSuccessSchema.extend({
    statusCode: z.literal(201).meta({ example: 201 }),
    data: z.any().nullable()
});
export class ApiCreatedClass extends createZodDto(ApiCreatedSchema) {}

export const ApiNoContentSchema = ApiResponseSchema.extend({
    statusCode: z.literal(204).meta({ example: 204 })
});
export class ApiNoContentClass extends createZodDto(ApiNoContentSchema) {}

export const ApiErrorSchema = ApiResponseSchema.extend({
    success: z.literal(false).meta({ example: false }),
    statusCode: z.number().int().min(400).max(599),
    error: z.string().min(1).nullable()
});
export class ApiErrorClass extends createZodDto(ApiErrorSchema) {};

export const BadRequestApiErrorSchema = ApiErrorSchema.extend({
    statusCode: z.literal(400).meta({ example: 400 }),
    error: z.literal("Bad Request").meta({ example: "Bad Request" })
});
export class BadRequestErrorClass extends createZodDto(BadRequestApiErrorSchema) {};

export const UnauthorizedApiErrorSchema = ApiErrorSchema.extend({
    statusCode: z.literal(401).meta({ example: 401 }),
    error: z.literal("Unauthorized").meta({ example: "Unauthorized" })
});
export class UnauthorizedErrorClass extends createZodDto(UnauthorizedApiErrorSchema) {};

export const ForbiddenApiErrorSchema = ApiErrorSchema.extend({
    statusCode: z.literal(403).meta({ example: 403 }),
    error: z.literal("Forbidden").meta({ example: "Forbidden" })
});
export class ForbiddenErrorClass extends createZodDto(ForbiddenApiErrorSchema) {};

export const NotFoundApiErrorSchema = ApiErrorSchema.extend({
    statusCode: z.literal(404).meta({ example: 404 }),
    error: z.literal("Not Found").meta({ example: "Not Found" })
});
export class NotFoundErrorClass extends createZodDto(NotFoundApiErrorSchema) {};

export const ConflictApiErrorSchema = ApiErrorSchema.extend({
    statusCode: z.literal(409).meta({ example: 409 }),
    error: z.literal("Conflict").meta({ example: "Conflict" })
});
export class ConflictErrorClass extends createZodDto(ConflictApiErrorSchema) {};

export const InternalServerApiErrorSchema = ApiErrorSchema.extend({
    statusCode: z.literal(500).meta({ example: 500 }),
    error: z.literal("Internal Server Error").meta({ example: "Internal Server Error" })
});
export class InternalServerErrorClass extends createZodDto(InternalServerApiErrorSchema) {}
