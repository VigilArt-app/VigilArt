import {
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Response } from "express";
import { ApiResponseData } from "@vigilart/shared/types";

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const errorBody: ApiResponseData = {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: null,
            error: "Internal Server Error"
        };
        const errorLabels: Record<number, string> = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            409: "Conflict",
            500: "Internal Server Error"
        } as const;

        if (exception instanceof HttpException) {
            errorBody.statusCode = exception.getStatus();

            const res = exception.getResponse();
            if (typeof res === "object" && res !== null) {
                const errorResponse = res as any;

                errorBody.message = Array.isArray(errorResponse.message)
                    ? errorResponse.message.join(", ")
                    : errorResponse.message;
                errorBody.error = errorResponse.error || "Internal Server Error";
            } else {
                errorBody.message = res;
                errorBody.error = exception.name;
            }
        } else if (exception instanceof Error) {
            errorBody.message = exception.message;
            errorBody.error = "Internal Server Error";
            this.logger.error(exception.stack);
        }
        errorBody.error = errorLabels[errorBody.statusCode] || errorBody.error;
        response.status(errorBody.statusCode).json(errorBody);
    }
}