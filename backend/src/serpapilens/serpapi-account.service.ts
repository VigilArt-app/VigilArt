import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  Logger,
  ServiceUnavailableException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";

export interface SerpApiQuota {
  searchesLeft: number;
  // YYYY-MM-DD, null when the account has no monthly plan.
  renewsOn: string | null;
}

// Short enough that a scan rarely sees a stale count, long enough that landing
// page visits do not each call SerpApi.
const QUOTA_CACHE_MS = 60 * 1000;

export class SearchQuotaExhaustedException extends ServiceUnavailableException {
  constructor(renewsOn: string | null) {
    super(
      renewsOn
        ? `Scans are paused until ${renewsOn}: the monthly search quota is reached.`
        : "Scans are paused: the monthly search quota is reached."
    );
  }
}

@Injectable()
export class SerpApiAccountService {
  private readonly logger = new Logger(SerpApiAccountService.name);
  private readonly apiKey: string;
  private cached?: { quota: SerpApiQuota | null; expiresAt: number };
  private inFlight?: Promise<SerpApiQuota | null>;

  constructor(
    private readonly httpService: HttpService,
    config: ConfigService
  ) {
    this.apiKey = config.getOrThrow<string>("SERP_API_GOOGLE_LENS_API_KEY");
  }

  // The quota belongs to the SerpApi account, so it covers every environment
  // sharing it. The Account API is free: it does not count as a search.
  // null when SerpApi cannot be read: callers let the scan run, and SerpApi
  // itself refuses searches past the quota.
  async getQuota(): Promise<SerpApiQuota | null> {
    if (this.cached && this.cached.expiresAt > Date.now()) {
      return this.cached.quota;
    }
    // One request at a time, so simultaneous callers share the same count.
    this.inFlight ??= this.fetchQuota().finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async fetchQuota(): Promise<SerpApiQuota | null> {
    let quota: SerpApiQuota | null = null;
    try {
      const { data } = await lastValueFrom(
        this.httpService.get("https://serpapi.com/account.json", {
          params: { api_key: this.apiKey },
          timeout: 5000
        })
      );
      if (typeof data?.total_searches_left === "number") {
        const renewal = data.plan_renewal_date;
        quota = {
          searchesLeft: data.total_searches_left,
          // Shown to visitors as a date: anything but YYYY-MM-DD is dropped.
          renewsOn:
            typeof renewal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(renewal)
              ? renewal
              : null
        };
      }
    } catch (error) {
      this.logger.warn(
        `Could not read the SerpApi quota: ${error instanceof Error ? error.message : error}`
      );
    }
    // A failure is cached too: while SerpApi is down, each visit would
    // otherwise wait for the timeout.
    this.cached = { quota, expiresAt: Date.now() + QUOTA_CACHE_MS };
    return quota;
  }

  // Preflight only: the searches are counted by reserveSearches when they run.
  async assertSearchesLeft(needed: number): Promise<void> {
    const quota = await this.getQuota();
    if (quota && quota.searchesLeft < needed) {
      throw new SearchQuotaExhaustedException(quota.renewsOn);
    }
  }

  // Call right before the searches run. Scans started within the cache window
  // would otherwise all see the same count and overshoot the quota together.
  // Check and decrement run with no await between them, so two scans in this
  // process cannot both take the last searches. Returns the refund to call when
  // the scan is refused or fails before searching.
  async reserveSearches(needed: number): Promise<() => void> {
    const quota = await this.getQuota();
    if (!quota) return () => undefined;
    if (quota.searchesLeft < needed) {
      throw new SearchQuotaExhaustedException(quota.renewsOn);
    }
    quota.searchesLeft -= needed;
    let refunded = false;
    // Refunds the count it was taken from: a newer read never saw it taken.
    return () => {
      if (refunded) return;
      refunded = true;
      quota.searchesLeft += needed;
    };
  }
}
