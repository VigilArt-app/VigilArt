import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const PUBLIC_SCAN_REDIS = "PUBLIC_SCAN_REDIS";

// A dedicated ioredis client: the budget needs INCR/DECR/EXPIRE, which the
// cache-manager (Keyv) abstraction used elsewhere does not expose.
export const publicScanRedisProvider: Provider = {
  provide: PUBLIC_SCAN_REDIS,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new Redis(config.getOrThrow<string>("REDIS_URL"))
};
