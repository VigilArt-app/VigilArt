import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { Request } from "express";

// Rate limiting for routes with no authenticated user: the only identity
// available is the caller's address. `req.ip` is trustworthy only because
// app.setup.ts declares how many proxies sit in front of the container; see the
// trust-proxy comment there.
@Injectable()
export class PublicThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    return req.ip ?? req.socket?.remoteAddress ?? "unknown";
  }

  // Two scans a week is right for strangers and only gets in the way while
  // developing the page. Read straight off process.env, the way
  // get-cookie-options.ts does, because ThrottlerGuard's constructor signature
  // is fixed by the base class and cannot take ConfigService.
  protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
    return process.env.NODE_ENV !== "production";
  }
}
