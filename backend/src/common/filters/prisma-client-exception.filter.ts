import { ArgumentsHost, Catch, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@vigilart/shared/server";
import { Response } from "express";
import {
  ConflictApiError,
  BadRequestApiError,
  NotFoundApiError
} from "@vigilart/shared/types";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(exception.message);
    switch (exception.code) {
      case "P2002": {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          success: false,
          statusCode: status,
          message: "Resource already exists",
          error: "Conflict"
        } satisfies ConflictApiError);
        break;
      }
      case "P2003": {
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          success: false,
          statusCode: status,
          message: "Invalid reference to related resource",
          error: "Bad Request"
        } satisfies BadRequestApiError);
        break;
      }
      case "P2025": {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          success: false,
          statusCode: status,
          message: "Resource not found",
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
