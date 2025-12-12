import request from "supertest";
import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma.service";
import { setupApp } from "../src/app.setup";

describe("Users E2E", () => {
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

  beforeEach(async () => {
    await prismaService.user.createMany({
      data: [
        {
          email: "emma.dao@mail.com",
          password: "Hashed_P4ssword",
          firstName: "Emma",
          lastName: "Dao",
          avatar: "url",
          subscriptionTier: "free",
        },
        {
          email: "anna@raimon.com",
          password: "Hashed_P4ssword2",
          firstName: "Anna",
          lastName: "Raimon",
          avatar: "url",
          subscriptionTier: "free",
        },
      ],
    });
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  it("Should create a user", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/users")
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
      avatar: expect.any(String),
      createdAt: expect.any(String),
      subscriptionTier: expect.any(String),
    });
  });

  it("Shouldn't create a user with an email already used", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        email: "anna@raimon.com",
        password: "Secure_P4ssword_",
        firstName: "Anna",
        lastName: "Willows",
      })
      .expect(HttpStatus.CONFLICT);
    expect(res.body.message).toBe("Email already in use");
  });

  it("Should get all users", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/users")
      .expect(HttpStatus.OK);

    expect(res.body.users).toHaveLength(2);
    expect(res.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          email: "emma.dao@mail.com",
          firstName: "Emma",
          lastName: "Dao",
          avatar: expect.any(String),
          subscriptionTier: expect.any(String),
          createdAt: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          email: "anna@raimon.com",
          firstName: "Anna",
          lastName: "Raimon",
          avatar: expect.any(String),
          subscriptionTier: expect.any(String),
          createdAt: expect.any(String),
        }),
      ])
    );
  });

  it("Should get specific user with ID", async () => {
    const user = await prismaService.user.create({
      data: {
        email: "amanda.rawles@mail.com",
        password: "Hashed_P4ssword_",
        firstName: "Amanda",
        lastName: "Rawles",
        avatar: "url",
        subscriptionTier: "free",
      },
    });
    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/${user.id}`)
      .expect(HttpStatus.OK);
    expect(res.body).toEqual({
      id: expect.any(String),
      email: "amanda.rawles@mail.com",
      password: expect.any(String),
      firstName: "Amanda",
      lastName: "Rawles",
      avatar: expect.any(String),
      createdAt: expect.any(String),
      subscriptionTier: expect.any(String),
    });
  });

  it("Shouldn't get user with non-existent ID", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/users/10")
      .expect(HttpStatus.OK);
    expect(res.body).toEqual({});
  });

  it("Should update specific user with ID", async () => {
    const user = await prismaService.user.create({
      data: {
        email: "amanda.rawles@mail.com",
        password: "Hashed_P4ssword_",
        firstName: "Amanda",
        lastName: "Rawles",
        avatar: "url",
        subscriptionTier: "free",
      },
    });
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}`)
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
    await request(app.getHttpServer())
      .patch("/api/v1/users/1")
      .send({
        avatar: "new_url",
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it("Should remove specific user with ID", async () => {
    const user = await prismaService.user.create({
      data: {
        email: "amanda.rawles@mail.com",
        password: "Hashed_P4ssword_",
        firstName: "Amanda",
        lastName: "Rawles",
        avatar: "url",
        subscriptionTier: "free",
      },
    });
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/users/${user.id}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it("Shouldn't remove user with non-existent ID", async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/users/100`)
      .expect(HttpStatus.NOT_FOUND);
  });

  afterAll(async () => {
    await app.close();
  });
});
