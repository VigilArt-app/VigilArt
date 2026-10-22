import { createHash } from "crypto";
import type { ExecutionContext } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { keyedThrottlerKey, throttlerKeySecret } from "./throttler-key";

class PublicScanController {
  start() {}
}

const context = {
  getClass: () => PublicScanController,
  getHandler: () => PublicScanController.prototype.start
} as unknown as ExecutionContext;

describe("keyedThrottlerKey", () => {
  const visitorIp = "203.0.113.42";

  it("gives the same key to the same visitor, so the per-IP limit still counts", () => {
    const key = keyedThrottlerKey("server-secret");
    expect(key(context, visitorIp, "public-scan")).toBe(
      key(context, visitorIp, "public-scan")
    );
    expect(key(context, visitorIp, "public-scan")).not.toBe(
      key(context, "198.51.100.7", "public-scan")
    );
  });

  it("cannot be recomputed from the IP without the server secret", () => {
    const stored = keyedThrottlerKey("server-secret")(context, visitorIp, "public-scan");
    // What an attacker can compute from the public code: the library's default key.
    const unkeyed = createHash("sha256")
      .update(`PublicScanController-start-public-scan-${visitorIp}`)
      .digest("hex");

    expect(stored).not.toBe(unkeyed);
    expect(stored).not.toBe(
      keyedThrottlerKey("guessed-secret")(context, visitorIp, "public-scan")
    );
  });
});

describe("throttlerKeySecret", () => {
  const config = (env: Record<string, string>) =>
    ({ get: (key: string) => env[key] }) as unknown as ConfigService;

  it("refuses to start production without a secret", () => {
    expect(() => throttlerKeySecret(config({ NODE_ENV: "production" }))).toThrow(
      /THROTTLER_KEY_SECRET is required/
    );
  });

  it("uses the configured secret", () => {
    expect(
      throttlerKeySecret(config({ NODE_ENV: "production", THROTTLER_KEY_SECRET: "from-doppler" }))
    ).toBe("from-doppler");
  });
});
