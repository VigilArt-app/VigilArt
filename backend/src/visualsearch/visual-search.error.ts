export type VisualSearchFailure =
  | "timeout"
  | "rate_limit"
  | "provider_error"
  | "invalid_config";

const MESSAGES: Record<VisualSearchFailure, string> = {
  timeout:
    "Scan failed: the visual search provider did not respond in time. Please try again.",
  rate_limit:
    "Scan failed: the visual search provider is receiving too many requests. Please try again in a few minutes.",
  provider_error:
    "Scan failed: the visual search provider is temporarily unavailable. Please try again later.",
  invalid_config:
    "Scan failed: scanning is temporarily unavailable on our side. Please try again later."
};

// A provider search that did not run, as opposed to one that found nothing.
// The message reaches the user, so it never carries the API key or the signed
// image URL; `detail` is for server logs only.
export class VisualSearchError extends Error {
  constructor(
    readonly failure: VisualSearchFailure,
    readonly detail?: string
  ) {
    super(MESSAGES[failure]);
    this.name = "VisualSearchError";
  }
}
