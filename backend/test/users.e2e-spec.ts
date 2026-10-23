import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier, type UserGet } from "@vigilart/shared";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { addUsers, initialUsers } from "../src/prisma/seeds/add-users";
import { DeviantArtDmcaFormJSON } from "@vigilart/shared";

// Account deletion removes the user's files from R2: keep tests off the real bucket.
const mockS3Send = jest.fn();
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  DeleteObjectsCommand: jest.fn().mockImplementation((input) => ({ input }))
}));

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
          mailNotificationsEnabled: false,
          mobileNotificationsEnabled: false,
          webNotificationsEnabled: false
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
          mailNotificationsEnabled: false,
          mobileNotificationsEnabled: false,
          webNotificationsEnabled: false
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
          mailNotificationsEnabled: false,
          mobileNotificationsEnabled: false,
          webNotificationsEnabled: false
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
          mailNotificationsEnabled: false,
          mobileNotificationsEnabled: false,
          webNotificationsEnabled: false
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
          mailNotificationsEnabled: false,
          mobileNotificationsEnabled: false,
          webNotificationsEnabled: false
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

  describe("DELETE /users/:id removes the account's files from storage", () => {
    let noticeId: string;

    beforeAll(async () => {
      await prismaService.dmcaPlatform.upsert({
        where: { slug: DeviantArtDmcaFormJSON.slug },
        create: DeviantArtDmcaFormJSON,
        update: {}
      });
    });

    beforeEach(async () => {
      mockS3Send.mockReset().mockResolvedValue({});
      await prismaService.user.update({
        where: { id: testUser.id },
        data: {
          avatar: "profiles/portrait-1b2c.png",
          artworks: {
            create: {
              originalFilename: "starry-night.jpg",
              storageKey: "artworks/starry-night-9f8e.jpg",
              contentType: "image/jpeg",
              sizeBytes: 603716,
              width: 1280,
              height: 1014
            }
          }
        }
      });
      noticeId = (await prismaService.dmcaNotice.create({
        data: { userId: testUser.id, dmcaPlatformSlug: DeviantArtDmcaFormJSON.slug }
      })).id;
    });

    afterAll(async () => {
      await prismaService.dmcaNotice.deleteMany();
      await prismaService.dmcaPlatform.deleteMany();
    });

    const deletedKeys = () =>
      mockS3Send.mock.calls.flatMap(([command]) =>
        command.input.Delete.Objects.map(({ Key }: { Key: string }) => Key)
      );

    it("deletes the artwork, the profile picture and the DMCA notice PDF", async () => {
      await api.delete(`/users/${testUser.id}`).expect(HttpStatus.NO_CONTENT);

      expect(deletedKeys().sort()).toEqual([
        "artworks/starry-night-9f8e.jpg",
        `dmca-notices/${noticeId}.pdf`,
        "profiles/portrait-1b2c.png"
      ]);
      expect(await prismaService.user.count({ where: { id: testUser.id } })).toBe(0);
    });

    it("keeps the account when storage fails, so deleting again removes everything", async () => {
      mockS3Send.mockRejectedValueOnce(new Error("R2 unavailable"));

      await api.delete(`/users/${testUser.id}`).expect(HttpStatus.SERVICE_UNAVAILABLE);
      expect(await prismaService.user.count({ where: { id: testUser.id } })).toBe(1);
      expect(await prismaService.artwork.count({ where: { userId: testUser.id } })).toBe(1);

      await api.delete(`/users/${testUser.id}`).expect(HttpStatus.NO_CONTENT);
      expect(deletedKeys()).toContain("artworks/starry-night-9f8e.jpg");
      expect(await prismaService.user.count({ where: { id: testUser.id } })).toBe(0);
    });

    it("finishes on a second attempt when the database fails after the files were removed", async () => {
      const userDelete = jest
        .spyOn(prismaService.user, "delete")
        .mockRejectedValueOnce(new Error("Connection terminated unexpectedly"));

      const failed = await api.delete(`/users/${testUser.id}`);
      expect(failed.status).toBeGreaterThanOrEqual(500);
      expect(await prismaService.user.count({ where: { id: testUser.id } })).toBe(1);

      // The files are already gone; R2 accepts deleting missing keys again.
      await api.delete(`/users/${testUser.id}`).expect(HttpStatus.NO_CONTENT);
      expect(mockS3Send).toHaveBeenCalledTimes(2);
      expect(await prismaService.user.count({ where: { id: testUser.id } })).toBe(0);
      userDelete.mockRestore();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
