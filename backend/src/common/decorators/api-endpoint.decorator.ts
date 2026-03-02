import { applyDecorators, HttpCode, HttpStatus, Type, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ApiResponseGeneric } from "./api-ok-response-generic.decorator";
import { CheckOwnership, type Ownerships } from "./check-ownership.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { OwnershipGuard } from "../guards/ownership.guard";
import {
  BadRequestErrorDTO,
  UnauthorizedErrorDTO,
  ForbiddenErrorDTO,
  NotFoundErrorDTO,
  ConflictErrorDTO,
  InternalServerErrorDTO,
  ApiErrorDTO
} from "@vigilart/shared/schemas";

const ERROR_MAP: Record<number, Type<ApiErrorDTO>> = {
  [HttpStatus.BAD_REQUEST]: BadRequestErrorDTO,
  [HttpStatus.UNAUTHORIZED]: UnauthorizedErrorDTO,
  [HttpStatus.FORBIDDEN]: ForbiddenErrorDTO,
  [HttpStatus.NOT_FOUND]: NotFoundErrorDTO,
  [HttpStatus.CONFLICT]: ConflictErrorDTO,
  [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorDTO
};

interface BaseApiEndpointOptions {
  summary: string;
  errors?: number[];
}

interface ProtectedOptions {
  protected: true;
  ownerships?: Ownerships[];
}

interface UnprotectedOptions {
  protected?: false;
  ownerships?: never;
}

type ProtectionOptions = ProtectedOptions | UnprotectedOptions;

type ApiEndpointOptions200 = BaseApiEndpointOptions & ProtectionOptions & {
  success: {
    status: HttpStatus.OK;
    type?: Type<unknown> | [Type<unknown>];
  };
};

type ApiEndpointOptions201 = BaseApiEndpointOptions & ProtectionOptions & {
  success: {
    status: HttpStatus.CREATED;
    type?: Type<unknown> | [Type<unknown>];
  };
};

type ApiEndpointOptions204 = BaseApiEndpointOptions & ProtectionOptions & {
  success: {
    status: HttpStatus.NO_CONTENT;
    type?: never;
  };
};

type ApiEndpointOptions =
  | ApiEndpointOptions200
  | ApiEndpointOptions201
  | ApiEndpointOptions204;

export function ApiEndpoint(options: ApiEndpointOptions) {
  const decorators: any[] = [];

  decorators.push(ApiOperation({ summary: options.summary }));
  decorators.push(HttpCode(options.success.status));
  if (options.success.status !== HttpStatus.NO_CONTENT)
    decorators.push(
      ApiResponseGeneric(options.success.status, options.success.type)
    );
  if (options.success.status === HttpStatus.NO_CONTENT)
    decorators.push(ApiResponseGeneric(options.success.status));
  if (options.errors) {
    options.errors.forEach((status) => {
      const ErrorClass = ERROR_MAP[status];

      if (ErrorClass)
        decorators.push(ApiResponse({ status, type: ErrorClass }));
      else decorators.push(ApiResponse({ status }));
    });
  }
  if (options.protected === true) {
    decorators.push(UseGuards(JwtAuthGuard));
    decorators.push(ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedErrorDTO }));
    decorators.push(ApiBearerAuth());
    if (options.ownerships && options.ownerships.length > 0) {
      decorators.push(CheckOwnership(options.ownerships));
      decorators.push(UseGuards(OwnershipGuard));
      decorators.push(ApiResponse({ status: HttpStatus.FORBIDDEN, type: ForbiddenErrorDTO }));
    }
  }

  return applyDecorators(...decorators);
}
