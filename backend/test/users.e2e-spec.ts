import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier } from "../src/generated/prisma/client";

describe("Users E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let api: ApiClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    setupApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    api = new ApiClient(app);
  });

  afterEach(async () => {
    await prismaService.resetDatabase();
  });

  describe("POST /users", () => {
    it("Should create a user", async () => {
      const res = await api
        .post("/users")
        .send({
          email: "yuki.endo@mail.com",
          password: "Secure_P4ssword",
          firstName: "Yuki",
          lastName: "Endo",
        })
        .expect(HttpStatus.CREATED);

      expect(res.body.password).toBeUndefined();
      expect(res.body).toEqual({
        id: expect.any(String),
        email: "yuki.endo@mail.com",
        firstName: "Yuki",
        lastName: "Endo",
        avatar: null,
        createdAt: expect.any(String),
        subscriptionTier: expect.any(String),
      });
    });

    it("Shouldn't create a user with an email already used", async () => {
      await prismaService.user.create({
        data: {
          email: "anna@raimon.com",
          password: "Hashed_P4ssword2",
          firstName: "Anna",
          lastName: "Raimon",
          subscriptionTier: SubscriptionTier.FREE,
        },
      });
      const res = await api
        .post("/users")
        .send({
          email: "anna@raimon.com",
          password: "Secure_P4ssword_",
          firstName: "Anna",
          lastName: "Willows",
        })
        .expect(HttpStatus.CONFLICT);
      expect(res.body.message).toBe("Email already in use");
    });

    it("Shouldn't create a user when required fields are missing", async () => {
      const res = await api
        .post("/users")
        .send({ email: "amelia@mail.com" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it("Shouldn't create a user with invalid mail", async () => {
      const res = await api
        .post("/users")
        .send({
          email: "amanda",
          password: "Secure_P4ssword",
          firstName: "Amanda",
          lastName: "Rowles",
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
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
            subscriptionTier: SubscriptionTier.FREE,
          },
          {
            email: "anna@raimon.com",
            password: "Hashed_P4ssword2",
            firstName: "Anna",
            lastName: "Raimon",
            subscriptionTier: SubscriptionTier.FREE,
          },
        ],
      });
      const res = await api.get("/users").expect(HttpStatus.OK);

      expect(res.body.users).toHaveLength(2);
      expect(res.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            email: "emma.dao@mail.com",
            firstName: "Emma",
            lastName: "Dao",
            subscriptionTier: expect.any(String),
            createdAt: expect.any(String),
          }),
          expect.objectContaining({
            id: expect.any(String),
            email: "anna@raimon.com",
            firstName: "Anna",
            lastName: "Raimon",
            subscriptionTier: expect.any(String),
            createdAt: expect.any(String),
          }),
        ])
      );
    });
  });

  describe("GET /users/:id", () => {
    it("Should get specific user with ID", async () => {
      await prismaService.user.create({
        data: {
          email: "emma.dao@mail.com",
          password: "Hashed_P4ssword",
          firstName: "Emma",
          lastName: "Dao",
          subscriptionTier: SubscriptionTier.FREE,
        },
      });
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });
      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }
      const res = await api.get(`/users/${user.id}`).expect(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: "Emma",
          lastName: "Dao",
          subscriptionTier: SubscriptionTier.FREE,
        })
      );
    });

    it("Shouldn't get user with non-existent ID", async () => {
      const res = await api
        .get("/users/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.OK);
      expect(res.body).toEqual({});
    });
  });

  describe("PATCH /users/:id", () => {
    it("Should update specific user with ID", async () => {
      const user = await prismaService.user.create({
        data: {
          email: "amanda.rawles@mail.com",
          password: "Hashed_P4ssword_",
          firstName: "Amanda",
          lastName: "Rawles",
          subscriptionTier: SubscriptionTier.FREE,
        },
      });
      const res = await api
        .patch(`/users/${user.id}`)
        .send({
          avatar: "new_url",
        })
        .expect(HttpStatus.OK);
      expect(res.body).toEqual({
        id: expect.any(String),
        email: "amanda.rawles@mail.com",
        firstName: "Amanda",
        lastName: "Rawles",
        avatar: "new_url",
        createdAt: expect.any(String),
        subscriptionTier: SubscriptionTier.FREE,
      });
    });

    it("Shouldn't update specific user with non-existent ID", async () => {
      await api
        .patch("/users/123e4567-e89b-12d3-a456-426614174000")
        .send({
          avatar: "new_url",
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("DELETE /users/:id", () => {
    it("Should remove specific user with ID", async () => {
      const user = await prismaService.user.create({
        data: {
          email: "amanda.rawles@mail.com",
          password: "Hashed_P4ssword_",
          firstName: "Amanda",
          lastName: "Rawles",
          subscriptionTier: SubscriptionTier.FREE,
        },
      });
      await api.delete(`/users/${user.id}`).expect(HttpStatus.NO_CONTENT);
    });

    it("Shouldn't remove user with non-existent ID", async () => {
      await api
        .delete("/users/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
