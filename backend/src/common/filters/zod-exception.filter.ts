import {
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
    ExceptionFilter
} from "@nestjs/common";
import { Response } from "express";
import { ApiErrorData } from "@vigilart/shared/types";
import { errorLabels } from "@vigilart/shared/constants";
import { ZodValidationException } from "nestjs-zod";

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ZodExceptionFilter.name);

    catch(exception: ZodValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const validationResponse = exception.getResponse() as any;
        const errors = validationResponse.errors || [];
        const messages = errors.map((err: any) => {
            const path = err.path && err.path.length > 0 ? `${err.path.join(".")}: ` : "";
            return `${path}${err.message}`;
        });
        const errorBody: ApiErrorData = {
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: messages.length > 0 ? messages.join("; ") : "Validation failed",
            error: errorLabels[HttpStatus.BAD_REQUEST]
        };

        this.logger.error(exception);
        response.status(errorBody.statusCode).json(errorBody);
    }
}