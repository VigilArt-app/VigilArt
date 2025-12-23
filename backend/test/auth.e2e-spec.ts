import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier } from "@vigilart/shared/enums";

describe("Auth E2E", () => {
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
    await prismaService.user.deleteMany();
  });

  describe("POST /signup", () => {
    it("Should signup successfully and return tokens and user profile", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
          firstName: "Emma",
          lastName: "Dao",
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Data created successfully.",
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(String),
          user: {
            id: expect.any(String),
            email: "emma.dao@mail.com",
            firstName: "Emma",
            lastName: "Dao",
            createdAt: expect.any(String),
            avatar: null,
            subscriptionTier: SubscriptionTier.FREE,
          },
        },
      });
    });

    it("Should handle uppercase in email", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "EMMA.dao@mail.com",
          password: "Secure_P4ssword",
          firstName: "Emma",
          lastName: "Dao",
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Data created successfully.",
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(String),
          user: {
            id: expect.any(String),
            email: "emma.dao@mail.com",
            firstName: "Emma",
            lastName: "Dao",
            createdAt: expect.any(String),
            avatar: null,
            subscriptionTier: SubscriptionTier.FREE,
          },
        },
      });
    });

    it("Shouldn't signup with an email already used", async () => {
      await api
        .post("/auth/signup")
        .send({
          email: "amanda.rowles@mail.com",
          password: "Secure_P4ssword",
          firstName: "Amanda",
          lastName: "Rowles",
        })
        .expect(HttpStatus.CREATED);
      const res = await api
        .post("/auth/signup")
        .send({
          email: "amanda.rowles@mail.com",
          password: "Secure_P4ssword",
          firstName: "Amanda",
          lastName: "Rowles",
        })
        .expect(HttpStatus.CONFLICT);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: "Email already in use",
        error: "Conflict",
      });
    });

    it("Shouldn't signup with a weak password", async () => {
      const res = await api
        .post("/auth/signup")
        .send({
          email: "amanda.rowles@mail.com",
          password: "notsecure",
          firstName: "Amanda",
          lastName: "Rowles",
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed",
        error: expect.any(String),
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
          firstName: "Amanda",
          lastName: "Rowles",
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed",
        error: "Invalid email address",
      });
    });
  });

  describe("POST /login", () => {
    it("Should login successfully", async () => {
      await api
        .post("/auth/signup")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
          firstName: "Emma",
          lastName: "Dao",
        })
        .expect(HttpStatus.CREATED);

      const res = await api
        .post("/auth/login")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "Request successful.",
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(String),
          user: {
            id: expect.any(String),
            email: "emma.dao@mail.com",
            firstName: "Emma",
            lastName: "Dao",
            createdAt: expect.any(String),
            subscriptionTier: SubscriptionTier.FREE,
            avatar: null,
          },
        },
      });
    });

    it("Shouldn't login - email not registered", async () => {
      const res = await api
        .post("/auth/login")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Invalid credentials",
        error: "Unauthorized",
      });
    });

    it("Shouldn't login - wrong password", async () => {
      await api
        .post("/auth/signup")
        .send({
          email: "emma.dao@mail.com",
          password: "Secure_P4ssword",
          firstName: "Emma",
          lastName: "Dao",
        })
        .expect(HttpStatus.CREATED);
      const res = await api
        .post("/auth/login")
        .send({
          email: "emma.dao@mail.com",
          password: "Wrong_password",
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Invalid credentials",
        error: "Unauthorized",
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
