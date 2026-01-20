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
import { ZodError } from "zod";

@Catch(ZodValidationException, ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ZodExceptionFilter.name);

    catch(exception: ZodValidationException | ZodError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let errors: ZodError;
        if (exception instanceof ZodError)
            errors = exception;
        else
            errors = exception.getZodError() as ZodError;

        const messages = errors.issues.map((err) => {
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