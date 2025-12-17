import { ArgumentsHost, Catch, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@vigilart/shared/server";
import { Response } from "express";
import { ConflictApiError, BadRequestApiError, NotFoundApiError } from "@vigilart/shared/types";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, "");

    switch (exception.code) {
        case "P2002": {
            const status = HttpStatus.CONFLICT;
            response.status(status).json({
                success: false,
                statusCode: status,
                message: message,
                error: "Conflict"
            } satisfies ConflictApiError);
            break;
        }
        case "P2003": {
            const status = HttpStatus.BAD_REQUEST;
            response.status(status).json({
                success: false,
                statusCode: status,
                message: message,
                error: "Bad Request"
            } satisfies BadRequestApiError);
            break;
        }
        case "P2025": {
            const status = HttpStatus.NOT_FOUND;
            response.status(status).json({
                success: false,
                statusCode: status,
                message: message,
                error: "Not Found"
            } satisfies NotFoundApiError);
            break;
        }
        default:
            super.catch(exception, host);
            break;
    }

  }
}
