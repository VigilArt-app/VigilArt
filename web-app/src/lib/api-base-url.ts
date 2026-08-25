// The API address on its own. `src/config.ts` also exports it, but importing
// that file starts Firebase up as a side effect. Firebase is only there for
// push notifications, which the landing page does not have, so importing it
// would ship a large unused library to every anonymous visitor for one string.
const raw = process.env.NEXT_PUBLIC_API_URL;

if (!raw) {
  throw new Error("NEXT_PUBLIC_API_URL is not set.");
}

export const API_BASE_URL = raw.replace(/\/+$/, "");

// Absent in local development, where the backend skips the bot check. Present
// in production, where the backend refuses to boot without its counterpart.
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;
