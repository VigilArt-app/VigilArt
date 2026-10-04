import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

// Run against a development server: production React omits attribute warnings.
const baseUrl = process.env.HYDRATION_TEST_URL ?? "http://localhost:3100";
const browser = process.env.CHROMIUM_BIN ?? "chromium-browser";

// Login and sign-up also exercise the application shell's Radix controls.
for (const path of ["/", "/faq", "/privacy", "/terms", "/login", "/sign-up"]) {
  test(`${path} hydrates without server/client mismatches`, async () => {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 200, "start the Next.js dev server first");

    const result = spawnSync(browser, [
      "--headless",
      "--disable-gpu",
      "--enable-logging=stderr",
      "--v=0",
      "--virtual-time-budget=5000",
      "--dump-dom",
      new URL(path, baseUrl).href,
    ], { encoding: "utf8", timeout: 30000, maxBuffer: 4 * 1024 * 1024 });

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /VigilArt/, "the application must render");
    assert.doesNotMatch(result.stdout, /Application error:/);
    assert.doesNotMatch(
      result.stderr,
      /A tree hydrated|Hydration failed|hydration mismatch|Uncaught /i,
    );
  });
}
