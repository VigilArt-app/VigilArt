import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PublicScanBudgetService } from "./public-scan-budget.service";
import { RedisService } from "../../redis/redis.service";

// The counters themselves run in a Redis script: they are exercised against a
// real Redis in test/scan-limits.e2e-spec.ts.
describe("PublicScanBudgetService", () => {
  let service: PublicScanBudgetService;
  let redis: { eval: jest.Mock; mget: jest.Mock };

  const build = async (
    env: Record<string, string | undefined>,
    nodeEnv = "production"
  ) => {
    redis = {
      eval: jest.fn().mockResolvedValue(1),
      mget: jest.fn().mockResolvedValue([null, null])
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicScanBudgetService,
        { provide: RedisService, useValue: redis },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === "NODE_ENV" ? nodeEnv : env[key])
          }
        }
      ]
    }).compile();
    service = module.get(PublicScanBudgetService);
  };

  describe("configuration", () => {
    it("Should default to 90 scans a month and 10 a day", async () => {
      await build({});
      expect(service.budget).toEqual({ monthly: 90, daily: 10 });
    });

    // An unset or malformed value must not mean "unlimited": that would leave
    // the Google Lens bill unbounded on a misconfigured deploy.
    it.each([" ", "not-a-number", "-1"])(
      "Should fall back to the defaults when the env vars are %p",
      async (raw) => {
        await build({ PUBLIC_SCAN_MONTHLY_BUDGET: raw, PUBLIC_SCAN_DAILY_CAP: raw });
        expect(service.budget).toEqual({ monthly: 90, daily: 10 });
      }
    );

    it("Should read both limits from the environment", async () => {
      await build({ PUBLIC_SCAN_MONTHLY_BUDGET: "30", PUBLIC_SCAN_DAILY_CAP: "0" });
      expect(service.budget).toEqual({ monthly: 30, daily: 0 });
    });
  });

  describe("reserve", () => {
    it("Should return the UTC day the scan was taken from", async () => {
      await build({});
      await expect(service.reserve()).resolves.toBe(
        new Date().toISOString().slice(0, 10)
      );
    });

    it("Should refuse when the script finds either budget spent", async () => {
      await build({});
      redis.eval.mockResolvedValue(0);
      await expect(service.reserve()).resolves.toBeNull();
    });
  });

  describe("remaining", () => {
    it("Should report the tighter of the monthly and daily remainders", async () => {
      await build({});
      redis.mget.mockResolvedValue(["85", "2"]);
      await expect(service.remaining()).resolves.toBe(5);

      redis.mget.mockResolvedValue(["40", "7"]);
      await expect(service.remaining()).resolves.toBe(3);
    });

    it("Should never report a negative remainder", async () => {
      await build({});
      redis.mget.mockResolvedValue(["95", "12"]);
      await expect(service.remaining()).resolves.toBe(0);
    });
  });

  // The cap exists to bound a bill that only production can run up, and it
  // makes the flow untestable locally. Same rule TurnstileService uses.
  describe("outside production", () => {
    it("Should let every scan through without touching Redis", async () => {
      await build({}, "development");

      await expect(service.reserve()).resolves.toBe("unenforced");
      await expect(service.reserve()).resolves.toBe("unenforced");
      expect(redis.eval).not.toHaveBeenCalled();
    });

    it("Should report a full budget, so the page never shows its used-up state", async () => {
      await build({}, "development");

      await expect(service.remaining()).resolves.toBe(10);
      expect(redis.mget).not.toHaveBeenCalled();
    });

    // An empty NODE_ENV is what a local .env leaves behind; it must not be
    // mistaken for production and start enforcing.
    it("Should treat an unset NODE_ENV as not production", async () => {
      await build({}, "");

      await expect(service.reserve()).resolves.toBe("unenforced");
      expect(redis.eval).not.toHaveBeenCalled();
    });
  });
});
