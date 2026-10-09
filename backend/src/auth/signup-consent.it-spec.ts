import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { SignUpSchema, UserUpdateSchema } from "@vigilart/shared/schemas";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import type { Cache } from "cache-manager";

const consent = {
  acceptedTerms: true,
  termsVersion: "2026-09-09",
  privacyVersion: "2026-10-04",
};
const credentials = { email: "ARTIST@example.com", password: "Secure_P4ssword" };

describe("signup consent", () => {
  it("accepts a signup without names and normalizes its email", () => {
    const result = SignUpSchema.safeParse({ ...credentials, ...consent });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("artist@example.com");
      expect(result.data).not.toHaveProperty("firstName");
      expect(result.data).not.toHaveProperty("lastName");
    }
  });

  it.each([undefined, false, "true", 1, null])("rejects non-explicit acceptance: %p", (acceptedTerms) => {
    expect(SignUpSchema.safeParse({
      ...credentials, ...consent, firstName: "Artist", lastName: "Test", acceptedTerms,
    }).success).toBe(false);
  });

  it.each([
    { termsVersion: undefined }, { privacyVersion: undefined },
    { termsVersion: "old" }, { privacyVersion: "old" },
    { privacyVersion: "2026-09-09" },
  ])("rejects missing or outdated versions: %p", (versions) => {
    expect(SignUpSchema.safeParse({
      ...credentials, ...consent, firstName: "Artist", lastName: "Test", ...versions,
    }).success).toBe(false);
  });

  it("does not allow profile updates to rewrite acceptance", () => {
    const update = UserUpdateSchema.parse({
      avatar: "profiles/avatar.png",
      termsAcceptedAt: "2000-01-01T00:00:00.000Z",
      termsVersion: "forged", privacyVersion: "forged",
    });
    expect(update.avatar).toBe("profiles/avatar.png");
    expect(update).not.toHaveProperty("termsAcceptedAt");
    expect(update).not.toHaveProperty("termsVersion");
    expect(update).not.toHaveProperty("privacyVersion");
  });

  it("persists acceptance and absent names in the same account creation", async () => {
    let stored: Record<string, unknown> | undefined;
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }) => {
          stored = data;
          return { id: "user-id", ...data };
        }),
      },
    } as unknown as PrismaService;
    const users = new UsersService(prisma, {} as Cache);
    const auth = new AuthService(users, {} as JwtService, new ConfigService({ SALT_ROUNDS: 4 }), prisma);
    const before = Date.now();
    await auth.signUp({ ...credentials, ...consent } as never);
    expect(stored).toEqual(expect.objectContaining({
      firstName: null, lastName: null,
      termsVersion: "2026-09-09", privacyVersion: "2026-10-04",
      termsAcceptedAt: expect.any(Date),
    }));
    expect((stored!.termsAcceptedAt as Date).getTime()).toBeGreaterThanOrEqual(before);
    expect((stored!.termsAcceptedAt as Date).getTime()).toBeLessThanOrEqual(Date.now());
    expect(stored).not.toHaveProperty("acceptedTerms");
    expect(stored!.password).not.toBe(credentials.password);
  });
});
