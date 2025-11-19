import request from "supertest";
import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier } from "../src/generated/prisma";

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

  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await prismaService.resetDatabase();
  });

  describe("GET /users", () => {
    it("Should get all users", async () => {
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
      const user = await prismaService.user.create({
        data: {
          email: "amanda.rawles@mail.com",
          password: "Hashed_P4ssword_",
          firstName: "Amanda",
          lastName: "Rawles",
          subscriptionTier: SubscriptionTier.FREE,
        },
      });
      const res = await api.get(`/users/${user.id}`).expect(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "amanda.rawles@mail.com",
          password: expect.any(String),
          firstName: "Amanda",
          lastName: "Rawles",
          createdAt: expect.any(String),
          subscriptionTier: expect.any(String),
        })
      );
    });

    it("Shouldn't get user with non-existent ID", async () => {
      const res = await api.get("/users/10").expect(HttpStatus.OK);
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
        subscriptionTier: user.subscriptionTier,
      });
    });

    it("Shouldn't update specific user with non-existent ID", async () => {
      await api
        .patch("/users/1")
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
      const res = await api
        .delete(`/users/${user.id}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it("Shouldn't remove user with non-existent ID", async () => {
      await api.delete("/users/100").expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
