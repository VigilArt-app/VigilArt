import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import {
  DeviantArtDmcaFormJSON,
  type DeviantArtDmcaPayload,
  SubscriptionTier,
  type UserGet
} from "@vigilart/shared";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { addUsers, initialUsers } from "../src/prisma/seeds/add-users";

describe("Users E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let api: ApiClient;
  let testUser: { email: string; password: string, id?: string };
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

  beforeEach(async () => {
    testUser = {
      email: "test.auth@mail.com",
      password: "Secure_P4ssword"
    };
    await api.signup(
      testUser.email,
      testUser.password,
      "Test",
      "User"
    );
    const user: UserGet = (await api.login(testUser.email, testUser.password)).body.data;
    testUser.id = user.id;
  });

  afterEach(async () => {
    await api.logout();
    await prismaService.user.deleteMany();
    await cacheManager.clear();
  });

  describe("seeded users", () => {
    it("creates nameless demo users without recording legal acceptance", async () => {
      await addUsers(prismaService);
      const users = await prismaService.user.findMany({
        where: { id: { in: initialUsers.map(({ id }) => id) } },
      });
      expect(users).toHaveLength(2);
      for (const user of users) {
        expect(user.firstName).toBeNull();
        expect(user.lastName).toBeNull();
        expect(user.termsAcceptedAt).toBeNull();
        expect(user.termsVersion).toBeNull();
        expect(user.privacyVersion).toBeNull();
      }
    });

    it("does not rewrite existing seeded accounts when rerun", async () => {
      const existing = await prismaService.user.create({ data: {
        id: initialUsers[0].id, email: initialUsers[0].email,
        password: "existing-password-hash", firstName: "Legacy", lastName: "Artist",
        termsAcceptedAt: new Date("2026-09-10T12:00:00.000Z"),
        termsVersion: "previous-terms", privacyVersion: "previous-privacy",
      } });
      await addUsers(prismaService);
      await addUsers(prismaService);
      expect(await prismaService.user.findUniqueOrThrow({ where: { id: existing.id } })).toEqual(existing);
    });
  });

  describe("POST /users", () => {
    // Removed route: it created accounts without signup consent (#271).
    it("no longer creates an account, even for a logged-in user", async () => {
      await api
        .post("/users")
        .send({
          email: "yuki.endo@mail.com",
          password: "Secure_P4ssword",
          firstName: "Yuki",
          lastName: "Endo"
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(await prismaService.user.findUnique({ where: { email: "yuki.endo@mail.com" } })).toBeNull();
    });
  });

  describe("GET /users", () => {
    it("Should get all users", async () => {
      await prismaService.user.createMany({
        data: [
          {
            email: "emma.dao@mail.com",
            password: "Hashed_P4ssword",
            firstName: "Emma",
            lastName: "Dao",
            subscriptionTier: SubscriptionTier.FREE
          },
          {
            email: "anna@raimon.com",
            password: "Hashed_P4ssword2",
            firstName: "Anna",
            lastName: "Raimon",
            subscriptionTier: SubscriptionTier.FREE
          }
        ]
      });
      const res = await api.get("/users").expect(HttpStatus.OK);
      const expectedUsers = [
        {
          id: expect.any(String),
          email: "test.auth@mail.com",
          firstName: null,
          lastName: null,
          subscriptionTier: SubscriptionTier.FREE,
          avatar: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        },
        {
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: "Emma",
          lastName: "Dao",
          subscriptionTier: SubscriptionTier.FREE,
          avatar: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        },
        {
          id: expect.any(String),
          email: "anna@raimon.com",
          firstName: "Anna",
          lastName: "Raimon",
          avatar: null,
          subscriptionTier: SubscriptionTier.FREE,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        }
      ];

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: expectedUsers
      });
    });
  });

  describe("GET /users/:id (basic user)", () => {
    it("Should get specific user with ID", async () => {
      const res = await api.get(`/users/${testUser.id}`).expect(HttpStatus.OK);
      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          id: expect.any(String),
          email: "test.auth@mail.com",
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

    it("Shouldn't get user with non-existent ID", async () => {
      const res = await api
        .get("/users/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api.get("/users/1").expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });
  });

  describe("PATCH /users/:id (basic user)", () => {
    it("Should update specific user with ID", async () => {
      const res = await api
        .patch(`/users/${testUser.id}`)
        .send({
          avatar: "new_url"
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          id: expect.any(String),
          email: "test.auth@mail.com",
          firstName: null,
          lastName: null,
          subscriptionTier: SubscriptionTier.FREE,
          avatar: "new_url",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          autoRunReports: false,
          notificationsEnabled: false
        },
      });
    });

    it("Shouldn't update specific user with non-existent ID", async () => {
      const res = await api
        .patch("/users/123e4567-e89b-12d3-a456-426614174000")
        .send({
          avatar: "new_url"
        })
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .patch("/users/1")
        .send({
          avatar: "new_url"
        })
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });
  });

  describe("DELETE /users/:id and DMCA notices", () => {
    // A notice holds the artist's name, address, phone and signature.
    const noticePayload: DeviantArtDmcaPayload = {
      infringing_content: {
        infringements: [
          { infringing_url: "https://deviantart.com/art/stolen-artwork-123456" }
        ],
        original_work_description: "My original digital artwork titled 'Sunset Dreams'",
        original_work_url: "https://myportfolio.com/artwork/sunset-dreams"
      },
      contact_information: {
        email: "john.doe@vigilart.app",
        full_name: "John Doe"
      },
      legal_declarations: { signature: "John Doe" }
    };

    beforeAll(async () => {
      await prismaService.dmcaPlatform.create({ data: DeviantArtDmcaFormJSON });
    });

    afterAll(async () => {
      await prismaService.dmcaNotice.deleteMany();
      await prismaService.dmcaPlatform.deleteMany();
    });

    it("deletes the account's notices with the account", async () => {
      const created = await api
        .post("/dmca/notice")
        .send({ dmcaPlatformSlug: "DEVIANTART", payload: noticePayload, userId: testUser.id, artworkId: null })
        .expect(HttpStatus.CREATED);

      await api.delete(`/users/${testUser.id}`).expect(HttpStatus.NO_CONTENT);

      expect(
        await prismaService.dmcaNotice.findUnique({ where: { id: created.body.data.id } })
      ).toBeNull();
    });

    it("keeps the notices of other accounts", async () => {
      const otherUser = await prismaService.user.create({
        data: { email: "other.artist@mail.com", password: "hashed" }
      });
      const otherNotice = await prismaService.dmcaNotice.create({
        data: { userId: otherUser.id, dmcaPlatformSlug: "DEVIANTART", payload: noticePayload }
      });

      await api.delete(`/users/${testUser.id}`).expect(HttpStatus.NO_CONTENT);

      expect(
        await prismaService.dmcaNotice.findUnique({ where: { id: otherNotice.id } })
      ).toMatchObject({ userId: otherUser.id });
    });
  });

  describe("DELETE /users/:id (basic user)", () => {
    it("Should remove specific user with ID", async () => {
      const res = await api
        .delete(`/users/${testUser.id}`)
        .expect(HttpStatus.NO_CONTENT);
      expect(res.body).toEqual({});

      const setCookie = res.headers["set-cookie"] as unknown as
        | string[]
        | undefined;
      const cookies = Array.isArray(setCookie) ? setCookie : [];
      expect(cookies.some((c) => c.startsWith("auth_token="))).toBe(true);
      expect(cookies.some((c) => c.startsWith("refresh_token="))).toBe(true);
    });

    it("Shouldn't remove user with non-existent ID", async () => {
      const res = await api
        .delete("/users/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api.delete("/users/1").expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
