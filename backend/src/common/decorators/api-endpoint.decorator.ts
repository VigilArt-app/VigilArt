import { applyDecorators, HttpCode, HttpStatus, Type } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ApiResponseGeneric } from "./api-ok-response-generic.decorator";
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
    [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorDTO,
};

interface ApiEndpointOptions200 {
    summary: string;
    success: {
        status: HttpStatus.OK;
        type?: Type<unknown> | [Type<unknown>];
        nullable?: boolean;
    };
    errors?: number[];
    protected?: boolean;
}

interface ApiEndpointOptions201 {
    summary: string;
    success: {
        status: HttpStatus.CREATED;
        type?: Type<unknown> | [Type<unknown>];
        nullable?: boolean;
    };
    errors?: number[];
    protected?: boolean;
}

interface ApiEndpointOptions204 {
    summary: string;
    success: {
        status: HttpStatus.NO_CONTENT;
        type?: never;
        nullable?: never;
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
        decorators.push(ApiResponseGeneric(options.success.status, options.success.type, options.success.nullable));
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
        decorators.push(ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedErrorDTO }));
        decorators.push(ApiResponse({ status: HttpStatus.FORBIDDEN, type: ForbiddenErrorDTO }));
        decorators.push(ApiBearerAuth());
    }

    return applyDecorators(...decorators);
}