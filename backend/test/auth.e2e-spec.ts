import request from "supertest";
import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma.service";
import { API_PREFIX, setupApp } from "../src/app.setup";

describe("Auth E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
  });

  afterEach(async () => {
    await prismaService.resetDatabase();
  });

  it("Should signup successfully and return tokens and user profile", async () => {
    const res = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/signup`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.expiresIn).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: "emma.dao@mail.com",
      firstName: "Emma",
      lastName: "Dao",
      avatar: expect.any(String),
      createdAt: expect.any(String),
      subscriptionTier: expect.any(String),
    });
  });

  it("Shouldn't signup with an email already used", async () => {
    await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/signup`)
      .send({
        email: "amanda.rowles@mail.com",
        password: "Secure_P4ssword",
        firstName: "Amanda",
        lastName: "Rowles",
      })
      .expect(HttpStatus.CREATED);
    const res = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/signup`)
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
      .post(`${API_PREFIX}/auth/signup`)
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
      .post(`${API_PREFIX}/auth/signup`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
      })
      .expect(HttpStatus.CREATED);

    const res = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
      })
      .expect(HttpStatus.OK);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.expiresIn).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: "emma.dao@mail.com",
      firstName: "Emma",
      lastName: "Dao",
      avatar: expect.any(String),
      createdAt: expect.any(String),
      subscriptionTier: expect.any(String),
    });
  });

  it("Shouldn't login - email not registered", async () => {
    const res = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
      })
      .expect(HttpStatus.UNAUTHORIZED);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("Shouldn't login - wrong password", async () => {
    await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/signup`)
      .send({
        email: "emma.dao@mail.com",
        password: "Secure_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
      })
      .expect(HttpStatus.CREATED);
    const res = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
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
