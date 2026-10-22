export const PUBLIC_SCAN_QUEUE = "public-scan";
export const PUBLIC_SCAN_JOB = "run-public-scan";

// A second ceiling on spend, independent of the counters: even if the
// budget were misconfigured, at most this many paid searches can be in flight.
export const PUBLIC_SCAN_CONCURRENCY = 2;

// Uploads are buffered in memory before the type check, so this is also the
// amount of memory one request can claim.
export const PUBLIC_SCAN_MAX_FILE_BYTES = 5 * 1024 * 1024;

// The finished job is the only place a result lives — nothing is written to
// Postgres. It is kept just long enough for the visitor to finish reading it.
export const PUBLIC_SCAN_RESULT_TTL_SECONDS = 60 * 60;

export const PUBLIC_SCAN_STORAGE_PREFIX = "public-scans";

// Budget counters, one key per UTC month ("2026-10") and one per UTC day
// ("2026-10-22"), so each expires on its own.
export const PUBLIC_SCAN_BUDGET_KEY = (period: string) =>
  `public-scan:budget:${period}`;

// Monthly so days without visitors do not lose their scans; the daily cap
// keeps one busy day from spending the whole month.
export const DEFAULT_PUBLIC_SCAN_MONTHLY_BUDGET = 90;
export const DEFAULT_PUBLIC_SCAN_DAILY_CAP = 10;
