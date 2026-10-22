import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { setupApp } from "./app.setup";

const trustProxyFor = async (env: Record<string, string>) => {
  const module = await Test.createTestingModule({
    providers: [{ provide: ConfigService, useValue: new ConfigService(env) }]
  }).compile();
  const app = module.createNestApplication<NestExpressApplication>({ logger: false });
  try {
    setupApp(app);
    return app.getHttpAdapter().getInstance().get("trust proxy");
  } finally {
    await app.close();
  }
};

describe("setupApp trust proxy", () => {
  // docker-compose.prod.yml passes an unset TRUST_PROXY_HOPS as "": without the
  // fallback every visitor shares the proxy's IP and its per-IP scan limit.
  it("trusts one proxy hop in production when TRUST_PROXY_HOPS is empty", async () => {
    await expect(trustProxyFor({ NODE_ENV: "production", TRUST_PROXY_HOPS: "" })).resolves.toBe(1);
    await expect(trustProxyFor({ NODE_ENV: "production", TRUST_PROXY_HOPS: " " })).resolves.toBe(1);
  });

  it("uses the configured hop count", async () => {
    await expect(trustProxyFor({ NODE_ENV: "production", TRUST_PROXY_HOPS: "2" })).resolves.toBe(2);
  });

  // The only way to opt out in production now that empty means one hop.
  it("trusts no proxy in production when TRUST_PROXY_HOPS is 0", async () => {
    await expect(trustProxyFor({ NODE_ENV: "production", TRUST_PROXY_HOPS: "0" })).resolves.toBeFalsy();
  });

  // Express would trust two hops for 1.5: a client could then forge its own IP.
  it.each(["1.5", "one"])("trusts no proxy for the invalid hop count %p", async (raw) => {
    await expect(trustProxyFor({ NODE_ENV: "production", TRUST_PROXY_HOPS: raw })).resolves.toBeFalsy();
  });

  it("trusts no proxy outside production unless configured", async () => {
    await expect(trustProxyFor({ NODE_ENV: "test", TRUST_PROXY_HOPS: "" })).resolves.toBeFalsy();
  });
});
