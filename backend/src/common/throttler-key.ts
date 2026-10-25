import { createHmac, randomBytes } from "crypto";
import type { ExecutionContext } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

// The throttler stores one Redis key per visitor IP for up to 30 days. Its
// default key is an unkeyed SHA-256 of public names plus the IP, which anyone
// can reverse by hashing the ~4 billion IPv4 addresses. Keying the hash with a
// server secret makes the stored value pseudonymous, as the CNIL and EDPB
// expect for IP addresses kept for abuse prevention.
export const keyedThrottlerKey =
  (secret: string) =>
  (context: ExecutionContext, tracker: string, throttlerName: string): string =>
    createHmac("sha256", secret)
      .update(
        `${context.getClass().name}-${context.getHandler().name}-${throttlerName}-${tracker}`
      )
      .digest("hex");

// Outside production the public throttler is skipped, so a per-boot secret is
// enough; production refuses to boot rather than store reversible IP hashes.
export const throttlerKeySecret = (config: ConfigService): string => {
  const secret = config.get<string>("THROTTLER_KEY_SECRET");
  if (secret) return secret;
  if (config.get<string>("NODE_ENV") === "production") {
    throw new Error(
      "THROTTLER_KEY_SECRET is required in production: visitor IPs would otherwise be stored as reversible hashes."
    );
  }
  return randomBytes(32).toString("hex");
};
