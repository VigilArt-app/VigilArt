import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const importConfig = (environment, turnstileSiteKey = "") =>
  spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module", "--eval", 'import("./src/config.ts")'],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        ...process.env,
        NODE_ENV: environment,
        NEXT_PUBLIC_API_URL: "https://api.example.test",
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: turnstileSiteKey
      },
      encoding: "utf8"
    }
  );

test("rejects a production build without a Turnstile site key", () => {
  const result = importConfig("production");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT_PUBLIC_TURNSTILE_SITE_KEY is required/);
});

test("allows development without a Turnstile site key", () => {
  const result = importConfig("development");

  assert.equal(result.status, 0, result.stderr);
});

test("rejects a blank production Turnstile site key", () => {
  const result = importConfig("production", "   ");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT_PUBLIC_TURNSTILE_SITE_KEY is required/);
});
