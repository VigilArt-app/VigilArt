import { StatisticsRange } from "@vigilart/shared";

export const REPORTS_QUEUE = "reports";
export const GENERATE_REPORT_JOB = "generate-report";

export const MAX_SCANS_PER_WINDOW = 10;
export const SCAN_WINDOW_DAYS = 30;

// Cache key for a user's aggregated statistics. Only the time-invariant "all"
// range is cached; the `v2` marker invalidates pre-existing cache entries.
// Shared so any mutation that changes a user's matches (report create/delete,
// artwork deletion) can invalidate the same entry.
export const REPORT_STATS_KEY = (
  userId: string,
  range: StatisticsRange = "all"
) => `reports:statistics:v2:${userId}:${range}`;
