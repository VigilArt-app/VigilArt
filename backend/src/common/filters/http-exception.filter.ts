import {
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    ExceptionFilter
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiErrorData } from "@vigilart/shared/types";
import { errorLabels } from "@vigilart/shared/constants";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const errorBody: ApiErrorData = {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: null,
            error: errorLabels[HttpStatus.INTERNAL_SERVER_ERROR]
        };
        const res = exception.getResponse();

        this.logger.error(exception);
        errorBody.statusCode = exception.getStatus();
        if (typeof res === "object" && res !== null) {
            const errorResponse = res as any;

            errorBody.message = Array.isArray(errorResponse.message)
                ? errorResponse.message.join(", ")
                : errorResponse.message;
            errorBody.error = errorLabels[errorBody.statusCode] || errorLabels[500];
        } else {
            errorBody.message = res;
            errorBody.error = exception.name;
        }
        if (errorBody.statusCode === HttpStatus.UNAUTHORIZED &&
            (request.path.includes('/auth/refresh') || request.path.includes('/auth/logout'))) {
            response.clearCookie('auth_token', { path: '/' });
            response.clearCookie('refresh_token', { path: '/' });
        }
        response.status(errorBody.statusCode).json(errorBody);
    }
}
