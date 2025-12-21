import request from "supertest";
import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ConfigService } from "@nestjs/config";

describe("Auth E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let apiPrefix: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    configService = app.get(ConfigService);
    apiPrefix = configService.get<string>("API_PREFIX") || "/api/v1";
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  it("Should signup successfully and return tokens and user profile", async () => {
    const res = await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/signup`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.expiresIn).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user).toEqual({
      id: expect.any(String),
      email: "emma.dao@mail.com",
      firstName: "Emma",
      lastName: "Dao",
      avatar: expect.any(String),
      subscriptionTier: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it("Shouldn't signup with an email already used", async () => {
    await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/signup`)
      .send({
        email: "amanda.rowles@mail.com",
        password: "Secure_P4ssword",
        firstName: "Amanda",
        lastName: "Rowles",
      })
      .expect(HttpStatus.CREATED);
    const res = await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/signup`)
      .send({
        email: "amanda.rowles@mail.com",
        password: "Secure_P4ssword",
        firstName: "Amanda",
        lastName: "Rowles",
      })
      .expect(HttpStatus.CONFLICT);
    expect(res.body.message).toBe("Email already in use");
  });

  it("Shouldn't signup with a weak password", async () => {
    const res = await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/signup`)
      .send({
        email: "amanda.rowles@mail.com",
        password: "notsecure",
        firstName: "Amanda",
        lastName: "Rowles",
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("Should login successfully", async () => {
    await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/signup`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
      })
      .expect(HttpStatus.CREATED);

    const res = await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/login`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
      })
      .expect(HttpStatus.OK);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.expiresIn).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user).toEqual({
      id: expect.any(String),
      email: "emma.dao@mail.com",
      firstName: "Emma",
      lastName: "Dao",
      avatar: expect.any(String),
      subscriptionTier: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it("Shouldn't login - email not registered", async () => {
    const res = await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/login`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
      })
      .expect(HttpStatus.UNAUTHORIZED);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("Shouldn't login - wrong password", async () => {
    await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/signup`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
      })
      .expect(HttpStatus.CREATED);
    const res = await request(app.getHttpServer())
      .post(`${apiPrefix}/auth/login`)
      .send({
        email: "emma.dao@mail.com",
        password: "Wrong_password",
      })
      .expect(HttpStatus.UNAUTHORIZED);
    expect(res.body.message).toBe("Invalid credentials");
  });

  afterAll(async () => {
    await app.close();
  });
});
