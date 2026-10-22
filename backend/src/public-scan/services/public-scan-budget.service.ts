import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../../redis/redis.service";
import {
  PUBLIC_SCAN_BUDGET_KEY,
  DEFAULT_PUBLIC_SCAN_MONTHLY_BUDGET,
  DEFAULT_PUBLIC_SCAN_DAILY_CAP
} from "../public-scan.constants";

const DAY_SECONDS = 24 * 60 * 60;
// Longer than any month, so the key outlives the month it counts.
const MONTH_SECONDS = 32 * DAY_SECONDS;

// Both counters move together or not at all. Only the first scan of a period
// sets its expiry; re-setting it on every request would push the reset away.
const RESERVE_SCRIPT = `
  local month = redis.call('INCR', KEYS[1])
  if month == 1 then redis.call('EXPIRE', KEYS[1], ARGV[3]) end
  local day = redis.call('INCR', KEYS[2])
  if day == 1 then redis.call('EXPIRE', KEYS[2], ARGV[4]) end
  if month > tonumber(ARGV[1]) or day > tonumber(ARGV[2]) then
    redis.call('DECR', KEYS[1])
    redis.call('DECR', KEYS[2])
    return 0
  end
  return 1
`;

// Midnight and key expiry must not refund a different period or create -1.
const RELEASE_SCRIPT = `
  for _, key in ipairs(KEYS) do
    local used = tonumber(redis.call('GET', key) or '0')
    if used > 0 then redis.call('DECR', key) end
  end
  return 0
`;

const readLimit = (raw: string | undefined, fallback: number): number => {
  const configured = raw?.trim() ? Number(raw) : NaN;
  return Number.isFinite(configured) && configured >= 0 ? configured : fallback;
};

// Limits logical public scan starts across visitors. Provider retries retain
// their existing behavior, so this is not a strict ceiling on billed calls.
@Injectable()
export class PublicScanBudgetService implements OnModuleInit {
  private readonly monthlyBudget: number;
  private readonly dailyCap: number;
  private readonly enforced: boolean;

  constructor(
    private readonly redis: RedisService,
    config: ConfigService
  ) {
    this.monthlyBudget = readLimit(
      config.get<string>("PUBLIC_SCAN_MONTHLY_BUDGET"),
      DEFAULT_PUBLIC_SCAN_MONTHLY_BUDGET
    );
    this.dailyCap = readLimit(
      config.get<string>("PUBLIC_SCAN_DAILY_CAP"),
      DEFAULT_PUBLIC_SCAN_DAILY_CAP
    );

    // Same rule TurnstileService and get-cookie-options already use, so the
    // codebase has one definition of "production" rather than two. The SerpApi
    // quota check still applies everywhere else.
    this.enforced = config.get<string>("NODE_ENV") === "production";
  }

  private readonly logger = new Logger(PublicScanBudgetService.name);

  onModuleInit() {
    if (!this.enforced) {
      this.logger.warn(
        "NODE_ENV is not production: the public-scan budget is NOT enforced. Every scan still costs a real Google Lens search."
      );
    }
  }

  get budget(): { monthly: number; daily: number } {
    return { monthly: this.monthlyBudget, daily: this.dailyCap };
  }

  // UTC so the reset moment does not move with the server's timezone.
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // The reservation is the UTC day: both counter keys derive from it, so a
  // release after midnight refunds the period the scan was taken from.
  private keys(day: string): [string, string] {
    return [PUBLIC_SCAN_BUDGET_KEY(day.slice(0, 7)), PUBLIC_SCAN_BUDGET_KEY(day)];
  }

  // Claims one scan up front. The script is atomic, so two simultaneous
  // requests on the last remaining scan cannot both succeed.
  async reserve(): Promise<string | null> {
    // Outside production the cap only gets in the way of testing the flow.
    if (!this.enforced) return "unenforced";

    const day = this.today();
    const reserved = await this.redis.eval(
      RESERVE_SCRIPT,
      2,
      ...this.keys(day),
      this.monthlyBudget,
      this.dailyCap,
      MONTH_SECONDS,
      DAY_SECONDS
    );
    return reserved === 1 ? day : null;
  }

  // Hands a reservation back when the request fails before any search is paid
  // for (bad file, storage error). Best-effort: losing a reservation costs one
  // free scan, while letting the error propagate would fail an otherwise
  // well-formed rejection.
  async release(day: string): Promise<void> {
    if (!this.enforced) return;

    try {
      await this.redis.eval(RELEASE_SCRIPT, 2, ...this.keys(day));
    } catch (error) {
      this.logger.error("Failed to release a public scan reservation", error);
    }
  }

  async remaining(): Promise<number> {
    // Reporting the full budget keeps the page out of its used-up state; the
    // counter itself is not shown to visitors.
    if (!this.enforced) return Math.min(this.monthlyBudget, this.dailyCap);

    const [month, day] = await this.redis.mget(...this.keys(this.today()));
    const used = (raw: string | null) => {
      const value = Number(raw ?? 0);
      return Number.isFinite(value) ? value : 0;
    };
    return Math.max(
      0,
      Math.min(this.monthlyBudget - used(month), this.dailyCap - used(day))
    );
  }
}
