import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 5000;

interface SiteVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

// Checks a Cloudflare Turnstile token: the proof, produced in the visitor's
// browser, that a human cleared the bot challenge. Cloudflare is the only
// party that can tell a genuine token from a forged one, hence the round trip.
@Injectable()
export class TurnstileService {
  private readonly secretKey: string | undefined;
  private readonly isProd: boolean;

  constructor(
    private readonly httpService: HttpService,
    config: ConfigService
  ) {
    this.secretKey = config.get<string>("TURNSTILE_SECRET_KEY");
    this.isProd = config.get<string>("NODE_ENV") === "production";

    if (!this.secretKey && this.isProd) {
      throw new Error(
        "TURNSTILE_SECRET_KEY is required in production: public routes would otherwise accept any request."
      );
    }
  }

  private readonly logger = new Logger(TurnstileService.name);

  // Fails closed everywhere except an unconfigured non-production environment,
  // so a contributor without a Cloudflare account can still run the app. The
  // constructor already refuses to boot production without a key.
  async verify(token: string | undefined, remoteIp?: string): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.warn(
        "TURNSTILE_SECRET_KEY is not set: bot check skipped (non-production only)."
      );
      return true;
    }
    if (!token) return false;

    const body = new URLSearchParams({
      secret: this.secretKey,
      response: token
    });
    // Cloudflare uses remoteip to spot a token replayed from another machine.
    if (remoteIp) body.set("remoteip", remoteIp);

    try {
      const { data } = await lastValueFrom(
        this.httpService.post<SiteVerifyResponse>(SITEVERIFY_URL, body, {
          timeout: SITEVERIFY_TIMEOUT_MS,
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
      );
      if (!data?.success) {
        this.logger.warn(
          `Turnstile rejected a token: ${data?.["error-codes"]?.join(", ") ?? "no error code"}`
        );
        return false;
      }
      return true;
    } catch (error) {
      // A Cloudflare outage must not become a free pass to the paid scan.
      this.logger.error("Turnstile verification request failed", error);
      return false;
    }
  }
}
