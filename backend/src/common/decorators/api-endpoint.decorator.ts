import { applyDecorators, HttpCode, HttpStatus, Type } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ApiResponseGeneric } from "./api-ok-response-generic.decorator";
import {
    BadRequestErrorClass,
    UnauthorizedErrorClass,
    ForbiddenErrorClass,
    NotFoundErrorClass,
    ConflictErrorClass,
    InternalServerErrorClass,
    ApiErrorClass
} from "@vigilart/shared/schemas";

const ERROR_MAP: Record<number, Type<ApiErrorClass>> = {
    [HttpStatus.BAD_REQUEST]: BadRequestErrorClass,
    [HttpStatus.UNAUTHORIZED]: UnauthorizedErrorClass,
    [HttpStatus.FORBIDDEN]: ForbiddenErrorClass,
    [HttpStatus.NOT_FOUND]: NotFoundErrorClass,
    [HttpStatus.CONFLICT]: ConflictErrorClass,
    [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorClass,
};

interface ApiEndpointOptions200 {
    summary: string;
    success: {
        status: HttpStatus.OK;
        type?: Type<unknown> | [Type<unknown>];
    };
    errors?: number[];
    protected?: boolean;
}

interface ApiEndpointOptions201 {
    summary: string;
    success: {
        status: HttpStatus.CREATED;
        type?: Type<unknown> | [Type<unknown>];
    };
    errors?: number[];
    protected?: boolean;
}

interface ApiEndpointOptions204 {
    summary: string;
    success: {
        status: HttpStatus.NO_CONTENT;
        type?: never;
    };
    errors?: number[];
    protected?: boolean;
}

type ApiEndpointOptions = ApiEndpointOptions200 | ApiEndpointOptions201 | ApiEndpointOptions204;

export function ApiEndpoint(options: ApiEndpointOptions) {
    const decorators: any[] = [];

    decorators.push(ApiOperation({ summary: options.summary }));
    decorators.push(HttpCode(options.success.status));
    if (options.success.status !== HttpStatus.NO_CONTENT)
        decorators.push(ApiResponseGeneric(options.success.status, options.success.type));
    if (options.success.status === HttpStatus.NO_CONTENT)
        decorators.push(ApiResponseGeneric(options.success.status));
    if (options.errors) {
        options.errors.forEach((status) => {
            const ErrorClass = ERROR_MAP[status];

            if (ErrorClass)
                decorators.push(ApiResponse({ status, type: ErrorClass }));
            else
                decorators.push(ApiResponse({ status }));
        });
    }
    if (options.protected) {
        decorators.push(ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedErrorClass }));
        decorators.push(ApiResponse({ status: HttpStatus.FORBIDDEN, type: ForbiddenErrorClass }));
        decorators.push(ApiBearerAuth());
    }

    return applyDecorators(...decorators);
}