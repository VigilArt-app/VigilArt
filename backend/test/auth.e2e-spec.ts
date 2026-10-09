import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient, signupConsent } from "./api-client";
import { SubscriptionTier } from "@vigilart/shared/enums";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

describe("Auth E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let api: ApiClient;
  let cacheManager: Cache;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    api = new ApiClient(app);
    cacheManager = app.get(CACHE_MANAGER);
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
    await cacheManager.clear();
  });

  describe("POST /signup", () => {
    it.each([
      { acceptedTerms: undefined }, { acceptedTerms: false }, { acceptedTerms: "true" },
      { termsVersion: undefined }, { privacyVersion: undefined },
      { termsVersion: "outdated" }, { privacyVersion: "outdated" },
    ])("rejects invalid consent without creating an account: %p", async (invalidConsent) => {
      await api.post("/auth/signup").send({
        email: "no-consent@example.com", password: "Secure_P4ssword",
        ...signupConsent, ...invalidConsent,
      }).expect(HttpStatus.BAD_REQUEST);
      expect(await prismaService.user.count()).toBe(0);
    });

    it("records server-timed acceptance in Postgres without trusting a supplied timestamp", async () => {
      const before = Date.now();
      await api.post("/auth/signup").send({
        email: "consent@example.com", password: "Secure_P4ssword", ...signupConsent,
        termsAcceptedAt: "2000-01-01T00:00:00.000Z",
      }).expect(HttpStatus.CREATED);
      const user = await prismaService.user.findUniqueOrThrow({ where: { email: "consent@example.com" } });
      expect(user.firstName).toBeNull();
      expect(user.lastName).toBeNull();
      expect(user.termsVersion).toBe("2026-09-09");
      expect(user.privacyVersion).toBe("2026-09-09");
      expect(user.termsAcceptedAt!.getTime()).toBeGreaterThanOrEqual(before);
      expect(user.termsAcceptedAt!.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("leaves legacy accounts without fabricated acceptance", async () => {
      const legacy = await prismaService.user.create({ data: {
        email: "legacy@example.com", password: "existing-hash", firstName: "Existing", lastName: "Artist",
      } });
      expect(legacy.termsAcceptedAt).toBeNull();
      expect(legacy.termsVersion).toBeNull();
      expect(legacy.privacyVersion).toBeNull();
      expect(legacy.firstName).toBe("Existing");
    });

    it("Should signup successfully and return tokens and user profile", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: null,
          lastName: null,
          avatar: null,
          subscriptionTier: SubscriptionTier.FREE,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        },
      });
    });

    it("Should handle uppercase in email", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "EMMA.dao@mail.com",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: null,
          lastName: null,
          avatar: null,
          subscriptionTier: SubscriptionTier.FREE,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        },
      });
    });

    it("Shouldn't signup with an email already used", async () => {
      await api
        .post("/auth/signup")
        .send({
          email: "amanda.rowles@mail.com",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.CREATED);
      const res = await api
        .post("/auth/signup")
        .send({
          email: "amanda.rowles@mail.com",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.CONFLICT);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: "Email already in use",
        error: "Conflict"
      });
    });

    it("Shouldn't signup with a weak password", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "amanda.rowles@mail.com",
          password: "notsecure",
          ...signupConsent
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request"
      });
    });

    it("Shouldn't signup when required fields are missing", async () => {
      const res = await api
        .post("/auth/signup")
        .send({ email: "amelia@mail.com" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it("Shouldn't signup with invalid mail", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "amanda",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request"
      });
    });
  });

  describe("POST /login", () => {
    it.each([
      ["/auth/login", false],
      ["/auth/mobile/login", true],
    ])("keeps consent audit data private when logging in via %s", async (route, mobile) => {
      await api.signup("private-audit@example.com", "Secure_P4ssword");
      const before = await prismaService.user.findUniqueOrThrow({
        where: { email: "private-audit@example.com" },
      });
      expect(before.termsAcceptedAt).not.toBeNull();

      const res = await api.post(route).send({
        email: "private-audit@example.com", password: "Secure_P4ssword",
      }).expect(HttpStatus.OK);
      const profile = mobile ? res.body.data.user : res.body.data;
      expect(profile).toEqual({
        id: before.id, email: "private-audit@example.com",
        firstName: null, lastName: null, avatar: null,
        subscriptionTier: SubscriptionTier.FREE,
        autoRunReports: false, notificationsEnabled: false,
        createdAt: before.createdAt.toISOString(), updatedAt: before.updatedAt.toISOString(),
      });
      if (mobile) {
        expect(res.body.data.accessToken).toEqual(expect.any(String));
        expect(res.body.data.refreshToken).toEqual(expect.any(String));
      }
      const after = await prismaService.user.findUniqueOrThrow({ where: { id: before.id } });
      expect(after.termsAcceptedAt).toEqual(before.termsAcceptedAt);
      expect(after.termsVersion).toBe("2026-09-09");
      expect(after.privacyVersion).toBe("2026-09-09");
    });

    it("Should login successfully", async () => {
      await api
        .post("/auth/signup")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.CREATED);

      const res = await api
        .post("/auth/login")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword"
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: null,
          lastName: null,
          subscriptionTier: SubscriptionTier.FREE,
          avatar: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        },
      });
    });

    it("Shouldn't login - email not registered", async () => {
      const res = await api
        .post("/auth/login")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword"
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("Shouldn't login - wrong password", async () => {
      await api
        .post("/auth/signup")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
          ...signupConsent
        })
        .expect(HttpStatus.CREATED);
      const res = await api
        .post("/auth/login")
        .send({
          email: "emma.dao@mail.com",
          password: "Wrong_password"
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
