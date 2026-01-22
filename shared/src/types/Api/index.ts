import {
  ApiResponseSchema,
  ApiSuccessSchema,
  ApiCreatedSchema,
  ApiNoContentSchema,
  ApiErrorSchema,
  BadRequestApiErrorSchema,
  UnauthorizedApiErrorSchema,
  ForbiddenApiErrorSchema,
  NotFoundApiErrorSchema,
  ConflictApiErrorSchema,
  InternalServerApiErrorSchema,
  ApiBatchPayloadSchema
} from "../../schemas/Api";
import { z } from "zod";

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type ApiSuccess<T> = z.infer<typeof ApiSuccessSchema> & {
  data: T | null;
};
export type ApiCreated<T> = z.infer<typeof ApiCreatedSchema> & {
  data: T | null;
};
export type ApiNoContent = z.infer<typeof ApiNoContentSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type BadRequestApiError = z.infer<typeof BadRequestApiErrorSchema>;
export type UnauthorizedApiError = z.infer<typeof UnauthorizedApiErrorSchema>;
export type ForbiddenApiError = z.infer<typeof ForbiddenApiErrorSchema>;
export type NotFoundApiError = z.infer<typeof NotFoundApiErrorSchema>;
export type ConflictApiError = z.infer<typeof ConflictApiErrorSchema>;
export type InternalServerApiError = z.infer<
  typeof InternalServerApiErrorSchema
>;

export type ApiErrorData =
    | ApiError
    | BadRequestApiError
    | UnauthorizedApiError
    | ForbiddenApiError
    | NotFoundApiError
    | ConflictApiError
    | InternalServerApiError;

export type ApiSuccessData<T = undefined> =
    | ApiSuccess<T>
    | ApiCreated<T>
    | ApiNoContent;

export type ApiResponseData<T = undefined> =
    | ApiErrorData
    | ApiSuccessData<T>;

export type ApiResponseAsync<T = undefined> = Promise<ApiResponseData<T>>;

export type ApiBatchPayload = z.infer<typeof ApiBatchPayloadSchema>;
