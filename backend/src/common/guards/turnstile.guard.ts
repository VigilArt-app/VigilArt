import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Request } from "express";
import { TurnstileService } from "../../turnstile/turnstile.service";

export const TURNSTILE_TOKEN_HEADER = "x-turnstile-token";

// Reads the bot-check token from a header rather than the request body so this
// guard can run before Nest's file interceptor buffers the upload. With the
// token in the body, a bot's 5 MB file would already be in memory by the time
// the check rejects it.
@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(private readonly turnstileService: TurnstileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers[TURNSTILE_TOKEN_HEADER];
    const token = Array.isArray(header) ? header[0] : header;

    const verified = await this.turnstileService.verify(token, request.ip);
    if (!verified) {
      throw new ForbiddenException(
        "Bot check failed. Please reload the page and try again."
      );
    }
    return true;
  }
}
