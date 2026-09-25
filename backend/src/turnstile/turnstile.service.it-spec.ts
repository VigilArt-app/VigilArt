import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import { TurnstileService } from "./turnstile.service";

describe("TurnstileService", () => {
  let httpService: { post: jest.Mock };

  const build = async (env: Record<string, string | undefined>) => {
    httpService = { post: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnstileService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: { get: (k: string) => env[k] } }
      ]
    }).compile();
    return module.get(TurnstileService);
  };

  it("Should accept a token Cloudflare confirms", async () => {
    const service = await build({ TURNSTILE_SECRET_KEY: "secret" });
    httpService.post.mockReturnValue(of({ data: { success: true } }));

    await expect(service.verify("token")).resolves.toBe(true);
  });

  it("Should reject a token Cloudflare refuses", async () => {
    const service = await build({ TURNSTILE_SECRET_KEY: "secret" });
    httpService.post.mockReturnValue(
      of({ data: { success: false, "error-codes": ["invalid-input-response"] } })
    );

    await expect(service.verify("token")).resolves.toBe(false);
  });

  it("Should reject a request that carries no token at all", async () => {
    const service = await build({ TURNSTILE_SECRET_KEY: "secret" });

    await expect(service.verify(undefined)).resolves.toBe(false);
    expect(httpService.post).not.toHaveBeenCalled();
  });

  // A Cloudflare outage must not become a free pass to the paid scan.
  it("Should reject when the verification request itself fails", async () => {
    const service = await build({ TURNSTILE_SECRET_KEY: "secret" });
    httpService.post.mockReturnValue(
      throwError(() => new Error("network down"))
    );

    await expect(service.verify("token")).resolves.toBe(false);
  });

  it("Should pass the caller's address so a replayed token is spotted", async () => {
    const service = await build({ TURNSTILE_SECRET_KEY: "secret" });
    httpService.post.mockReturnValue(of({ data: { success: true } }));

    await service.verify("token", "203.0.113.7");

    const body = httpService.post.mock.calls[0][1] as URLSearchParams;
    expect(body.get("remoteip")).toBe("203.0.113.7");
  });

  // Without a key there is nothing to verify against, so production must not
  // boot: it would silently accept every request to the public scan.
  it("Should refuse to start in production without a secret key", async () => {
    await expect(build({ NODE_ENV: "production" })).rejects.toThrow(
      /TURNSTILE_SECRET_KEY is required/
    );
  });

  // Local development has no Cloudflare account; the constructor check above is
  // what keeps this from ever applying in production.
  it("Should skip the check when unconfigured outside production", async () => {
    const service = await build({ NODE_ENV: "development" });

    await expect(service.verify(undefined)).resolves.toBe(true);
  });
});
