// Named rate-limit buckets for the public (unauthenticated) routes. Values are
// deliberately asymmetric: starting a scan spends a paid Google Lens search,
// reading its result costs nothing but is polled every 2 seconds.
export const PUBLIC_SCAN_THROTTLER = "public-scan";
export const PUBLIC_POLL_THROTTLER = "public-poll";

const DAY_MS = 24 * 60 * 60 * 1000;

// Per visitor. Smaller than the global daily budget on purpose, so one visitor
// cannot take the whole day's allowance.
export const PUBLIC_SCAN_TTL_MS = 7 * DAY_MS;
export const PUBLIC_SCAN_LIMIT = 2;

// A visitor polls for up to 3 minutes at one request every 2 seconds (~90
// requests); the ceiling has to clear that or they lock themselves out of the
// result they just paid for.
export const PUBLIC_POLL_TTL_MS = 60 * 1000;
export const PUBLIC_POLL_LIMIT = 120;
