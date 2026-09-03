import assert from "node:assert/strict";
import test from "node:test";
import { isPublicScanDisabled } from "../src/components/landing/scan/scan-availability.ts";

test("disables scanning while a configured Turnstile widget has no token", () => {
  assert.equal(
    isPublicScanDisabled({
      hasFile: true,
      busy: false,
      turnstileRequired: true,
      turnstileToken: null
    }),
    true
  );
});

test("allows scanning without Turnstile in development", () => {
  assert.equal(
    isPublicScanDisabled({
      hasFile: true,
      busy: false,
      turnstileRequired: false,
      turnstileToken: null
    }),
    false
  );
});
