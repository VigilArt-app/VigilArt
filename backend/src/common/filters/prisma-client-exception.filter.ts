import { ArgumentsHost, Catch, HttpStatus, ExceptionFilter, Logger } from "@nestjs/common";
import { Prisma } from "@vigilart/shared/server";
import { Response } from "express";
import { ApiErrorData } from "@vigilart/shared/types";
import { errorLabels } from "@vigilart/shared";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaClientExceptionFilter.name);

    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const errorBody: ApiErrorData = {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: null,
            error: errorLabels[HttpStatus.INTERNAL_SERVER_ERROR]
        };
        const lines = exception.message.split('\n').filter(line => line.trim());
        const userMessage = lines.at(-1) || exception.message;

        this.logger.error(exception);
        errorBody.message = userMessage;
        switch (exception.code) {
            case "P2002":
                errorBody.statusCode = HttpStatus.CONFLICT;
                errorBody.error = errorLabels[HttpStatus.CONFLICT];
                break;
            case "P2003":
                errorBody.statusCode = HttpStatus.BAD_REQUEST;
                errorBody.error = errorLabels[HttpStatus.BAD_REQUEST];
                break;
            case "P2025":
                errorBody.statusCode = HttpStatus.FORBIDDEN;
                errorBody.error = errorLabels[HttpStatus.FORBIDDEN];
                break;
            default:
                errorBody.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                errorBody.error = errorLabels[HttpStatus.INTERNAL_SERVER_ERROR];
        }
        response.status(errorBody.statusCode).json(errorBody);
    }
}
