import {
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    ExceptionFilter
} from "@nestjs/common";
import { Response } from "express";
import { ApiErrorData } from "@vigilart/shared/types";
import { errorLabels } from "@vigilart/shared/constants";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
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
            errorBody.error = errorResponse.error || "Internal Server Error";
        } else {
            errorBody.message = res;
            errorBody.error = exception.name;
        }
        response.status(errorBody.statusCode).json(errorBody);
    }
}