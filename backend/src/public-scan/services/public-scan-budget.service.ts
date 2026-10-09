import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../../redis/redis.service";
import {
  PUBLIC_SCAN_BUDGET_KEY,
  DEFAULT_PUBLIC_SCAN_DAILY_BUDGET
} from "../public-scan.constants";

const DAY_SECONDS = 24 * 60 * 60;

// Limits logical public scan starts across visitors. Provider retries retain
// their existing behavior, so this is not a strict ceiling on billed calls.
@Injectable()
export class PublicScanBudgetService implements OnModuleInit {
  private readonly dailyBudget: number;
  private readonly enforced: boolean;

  constructor(
    private readonly redis: RedisService,
    config: ConfigService
  ) {
    const raw = config.get<string>("PUBLIC_SCAN_DAILY_BUDGET");
    const configured = raw?.trim() ? Number(raw) : NaN;
    this.dailyBudget =
      Number.isFinite(configured) && configured >= 0
        ? configured
        : DEFAULT_PUBLIC_SCAN_DAILY_BUDGET;

    // Same rule TurnstileService and get-cookie-options already use, so the
    // codebase has one definition of "production" rather than two. Anything
    // that is not production, staging included, must set NODE_ENV=production
    // if it talks to the real Google Lens key.
    this.enforced = config.get<string>("NODE_ENV") === "production";
  }

  private readonly logger = new Logger(PublicScanBudgetService.name);

  onModuleInit() {
    if (!this.enforced) {
      this.logger.warn(
        "NODE_ENV is not production: the daily public-scan budget is NOT enforced. Every scan still costs a real Google Lens search."
      );
    }
  }

  // UTC so the reset moment does not move with the server's timezone.
  private todayKey(): string {
    return PUBLIC_SCAN_BUDGET_KEY(new Date().toISOString().slice(0, 10));
  }

  get budget(): number {
    return this.dailyBudget;
  }

  // Claims one scan up front. INCR is atomic, so two simultaneous requests on
  // the last remaining scan cannot both succeed — checking then incrementing
  // would let them.
  async reserve(): Promise<string | null> {
    // Outside production the cap only gets in the way of testing the flow.
    if (!this.enforced) return "unenforced";

    const key = this.todayKey();
    const used = await this.redis.incr(key);
    // Only the first caller of the day sets the expiry; re-setting it on every
    // request would push the reset further away with each scan.
    if (used === 1) await this.redis.expire(key, DAY_SECONDS);

    if (used > this.dailyBudget) {
      await this.release(key);
      return null;
    }
    return key;
  }

  // Hands a reservation back when the request fails before any search is paid
  // for (bad file, storage error). Best-effort: losing a reservation costs one
  // free scan, while letting the error propagate would fail an otherwise
  // well-formed rejection.
  async release(key: string): Promise<void> {
    if (!this.enforced) return;

    try {
      // Midnight and key expiry must not refund a different day or create -1.
      await this.redis.eval(`
        local used = tonumber(redis.call('GET', KEYS[1]) or '0')
        if used > 0 then return redis.call('DECR', KEYS[1]) end
        return 0
      `, 1, key);
    } catch (error) {
      this.logger.error("Failed to release a public scan reservation", error);
    }
  }

  async remainingToday(): Promise<number> {
    // Reporting the full budget keeps the page out of its used-up state; the
    // counter itself is not shown to visitors.
    if (!this.enforced) return this.dailyBudget;

    const raw = await this.redis.get(this.todayKey());
    const used = Number(raw ?? 0);
    return Math.max(0, this.dailyBudget - (Number.isFinite(used) ? used : 0));
  }
}
