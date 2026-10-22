import { ConfigService } from "@nestjs/config";
import { ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import type { Cache } from "cache-manager";

const signup = {
  email: "artist@example.com",
  password: "Secure_P4ssword",
  termsVersion: "2026-09-09",
  privacyVersion: "2026-10-09",
};

const buildAuth = (env: Record<string, string>, existingUser: unknown = null) => {
  const prisma = {
    user: {
      findFirst: jest.fn().mockResolvedValue(existingUser),
      create: jest.fn().mockImplementation(async ({ data }) => ({ id: "user-id", ...data })),
    },
  } as unknown as PrismaService;
  const auth = new AuthService(
    new UsersService(prisma, {} as Cache),
    {} as JwtService,
    new ConfigService({ SALT_ROUNDS: 4, ...env }),
    prisma
  );
  return { auth, create: prisma.user.create as jest.Mock };
};

describe("signup switch", () => {
  it("refuses a new account when signup is disabled", async () => {
    const { auth, create } = buildAuth({ SIGNUP_DISABLED: "true" });
    await expect(auth.signUp(signup as never)).rejects.toThrow(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(["TRUE", " true "])("also reads %p as disabled", async (value) => {
    const { auth, create } = buildAuth({ SIGNUP_DISABLED: value });
    await expect(auth.signUp(signup as never)).rejects.toThrow(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });

  it("answers 403, not 409, for an email already in use, so the closed environment reveals no account", async () => {
    const { auth } = buildAuth({ SIGNUP_DISABLED: "true" }, { id: "existing", email: signup.email });
    await expect(auth.signUp(signup as never)).rejects.toThrow(ForbiddenException);
  });

  it.each([{}, { SIGNUP_DISABLED: "false" }, { SIGNUP_DISABLED: "" }])(
    "still creates the account when signup is not disabled: %p",
    async (env) => {
      const { auth, create } = buildAuth(env);
      await auth.signUp(signup as never);
      expect(create).toHaveBeenCalledTimes(1);
    }
  );
});
