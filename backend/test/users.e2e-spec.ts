import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier, type UserGet } from "@vigilart/shared";

describe("Users E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let api: ApiClient;
  let testUser: { email: string; password: string, id?: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();

    setupApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    api = new ApiClient(app);
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
  });

  describe("POST /users", () => {
    it("Should create a user", async () => {
      const res = await api
        .post("/users")
        .send({
          email: "yuki.endo@mail.com",
          password: "Secure_P4ssword",
          firstName: "Yuki",
          lastName: "Endo"
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          id: expect.any(String),
          email: "yuki.endo@mail.com",
          firstName: "Yuki",
          lastName: "Endo",
          avatar: null,
          subscriptionTier: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
      });
    });

    it("Shouldn't create a user with an email already used", async () => {
      await prismaService.user.create({
        data: {
          email: "anna@raimon.com",
          password: "Hashed_P4ssword2",
          firstName: "Anna",
          lastName: "Raimon",
          subscriptionTier: SubscriptionTier.FREE
        }
      });
      const res = await api
        .post("/users")
        .send({
          email: "anna@raimon.com",
          password: "Secure_P4ssword_",
          firstName: "Anna",
          lastName: "Willows"
        })
        .expect(HttpStatus.CONFLICT);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: expect.any(String),
        error: "Conflict"
      });
    });

    it("Shouldn't create a user when required fields are missing", async () => {
      const res = await api
        .post("/users")
        .send({ email: "amelia@mail.com" })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request"
      });
    });

    it("Shouldn't create a user with invalid mail", async () => {
      const res = await api
        .post("/users")
        .send({
          email: "amanda",
          password: "Secure_P4ssword",
          firstName: "Amanda",
          lastName: "Rowles"
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
          firstName: "Test",
          lastName: "User",
          subscriptionTier: SubscriptionTier.FREE,
          avatar: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        {
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: "Emma",
          lastName: "Dao",
          subscriptionTier: SubscriptionTier.FREE,
          avatar: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        {
          id: expect.any(String),
          email: "anna@raimon.com",
          firstName: "Anna",
          lastName: "Raimon",
          avatar: null,
          subscriptionTier: SubscriptionTier.FREE,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
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
          firstName: "Test",
          lastName: "User",
          subscriptionTier: SubscriptionTier.FREE,
          avatar: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
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
          firstName: "Test",
          lastName: "User",
          subscriptionTier: SubscriptionTier.FREE,
          avatar: "new_url",
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
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
