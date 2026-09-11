import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PublicScanBudgetService } from "./public-scan-budget.service";
import { RedisService } from "../../redis/redis.service";

describe("PublicScanBudgetService", () => {
  let service: PublicScanBudgetService;
  let redis: {
    incr: jest.Mock;
    decr: jest.Mock;
    expire: jest.Mock;
    get: jest.Mock;
  };

  const build = async (budget: string | undefined, nodeEnv = "production") => {
    redis = {
      incr: jest.fn(),
      decr: jest.fn().mockResolvedValue(0),
      expire: jest.fn().mockResolvedValue(1),
      get: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicScanBudgetService,
        { provide: RedisService, useValue: redis },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === "NODE_ENV" ? nodeEnv : budget
          }
        }
      ]
    }).compile();
    service = module.get(PublicScanBudgetService);
  };

  describe("reserve", () => {
    it("Should allow a scan below the daily budget", async () => {
      await build("5");
      redis.incr.mockResolvedValue(3);

      await expect(service.reserve()).resolves.toBe(true);
      expect(redis.decr).not.toHaveBeenCalled();
    });

    it("Should allow the last scan of the day", async () => {
      await build("5");
      redis.incr.mockResolvedValue(5);

      await expect(service.reserve()).resolves.toBe(true);
    });

    // Without the DECR the counter climbs on every refused request, so the
    // page would report a shrinking allowance that was never actually spent.
    it("Should refuse and give the increment back once the budget is spent", async () => {
      await build("5");
      redis.incr.mockResolvedValue(6);

      await expect(service.reserve()).resolves.toBe(false);
      expect(redis.decr).toHaveBeenCalledTimes(1);
    });

    // Re-setting the TTL on every scan would push the daily reset further away
    // with each request, so a busy day would never reset.
    it("Should set the day's expiry only on the first scan", async () => {
      await build("5");
      redis.incr.mockResolvedValue(1);
      await service.reserve();
      expect(redis.expire).toHaveBeenCalledTimes(1);

      redis.incr.mockResolvedValue(2);
      await service.reserve();
      expect(redis.expire).toHaveBeenCalledTimes(1);
    });

    it("Should refuse every scan when the budget is set to zero", async () => {
      await build("0");
      redis.incr.mockResolvedValue(1);

      await expect(service.reserve()).resolves.toBe(false);
    });

    // An unset or malformed value must not mean "unlimited": that would leave
    // the Google Lens bill unbounded on a misconfigured deploy.
    it("Should fall back to the built-in budget when the env var is unusable", async () => {
      await build(undefined);
      expect(service.budget).toBe(5);

      await build("not-a-number");
      expect(service.budget).toBe(5);
    });
  });

  // The cap exists to bound a bill that only production can run up, and it
  // makes the flow untestable locally. Same rule TurnstileService uses.
  describe("outside production", () => {
    it("Should let every scan through without touching Redis", async () => {
      await build("5", "development");

      await expect(service.reserve()).resolves.toBe(true);
      await expect(service.reserve()).resolves.toBe(true);
      await expect(service.reserve()).resolves.toBe(true);
      expect(redis.incr).not.toHaveBeenCalled();
    });

    it("Should report the full budget, so the page never shows its used-up state", async () => {
      await build("5", "development");

      await expect(service.remainingToday()).resolves.toBe(5);
      expect(redis.get).not.toHaveBeenCalled();
    });

    // An empty NODE_ENV is what a local .env leaves behind; it must not be
    // mistaken for production and start enforcing.
    it("Should treat an unset NODE_ENV as not production", async () => {
      await build("5", "");

      await expect(service.reserve()).resolves.toBe(true);
      expect(redis.incr).not.toHaveBeenCalled();
    });
  });

  describe("remainingToday", () => {
    it("Should report the full budget before any scan", async () => {
      await build("5");
      redis.get.mockResolvedValue(null);

      await expect(service.remainingToday()).resolves.toBe(5);
    });

    it("Should never report a negative remainder", async () => {
      await build("5");
      redis.get.mockResolvedValue("9");

      await expect(service.remainingToday()).resolves.toBe(0);
    });
  });
});
