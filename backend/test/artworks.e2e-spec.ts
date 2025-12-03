import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier } from "../src/generated/prisma";

describe("Artworks E2E", () => {
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
    const user = await prismaService.user.create({
      data: {
        email: "emma.dao@mail.com",
        password: "Hashed_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
        subscriptionTier: SubscriptionTier.FREE,
      },
    });
    const user2 = await prismaService.user.create({
      data: {
        email: "amanda.rawles@mail.com",
        password: "Hashed_P4ssword",
        firstName: "Amanda",
        lastName: "Rawles",
        subscriptionTier: SubscriptionTier.FREE,
      },
    });
    await prismaService.artwork.createMany({
      data: [
        {
          userId: user.id,
          imageUri: "image_uri",
          originalFilename: "watercolor",
          contentType: "image/png",
          sizeBytes: 2543872,
          description: "Watercolor painting",
        },
        {
          userId: user2.id,
          imageUri: "image_uri_drawing",
        },
      ],
    });
  });

  afterEach(async () => {
    await prismaService.resetDatabase();
  });

  describe("POST /artworks", () => {
    it("Should create an artwork - required fields only", async () => {
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }
      const res = await api
        .post("/artworks")
        .send({
          userId: user.id,
          imageUri: "image_uri",
        })
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          userId: user.id,
          imageUri: "image_uri",
        })
      );
    });

    it("Should create an artwork - with optional fields", async () => {
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }

      const res = await api
        .post("/artworks")
        .send({
          userId: user.id,
          imageUri: "image_uri",
          originalFilename: "watercolor",
          contentType: "image/png",
          sizeBytes: 2543872,
          description: "Watercolor painting",
        })
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          userId: user.id,
          imageUri: "image_uri",
          originalFilename: "watercolor",
          contentType: "image/png",
          sizeBytes: 2543872,
          description: "Watercolor painting",
        })
      );
    });

    it("Shouldn't create an artwork when required fields are missing", async () => {
      const res = await api
        .post("/artworks")
        .send({ imageUri: "image_uri" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it("Shouldn't create an artwork if non-existent user id", async () => {
      const res = await api
        .post("/artworks")
        .send({ userId: "id", imageUri: "image_uri" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual("User does not exist");
    });
  });

  describe("GET /artworks", () => {
    it("Should get all artworks", async () => {
      const res = await api.get("/artworks").expect(HttpStatus.OK);

      expect(res.body.artworks).toHaveLength(2);
      expect(res.body.artworks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            imageUri: "image_uri",
            originalFilename: "watercolor",
            contentType: "image/png",
            sizeBytes: 2543872,
            description: "Watercolor painting",
          }),
          expect.objectContaining({
            imageUri: "image_uri_drawing",
          }),
        ])
      );
    });
  });

  describe("GET /artworks/user/:id", () => {
    it("Should get all artworks for user with specific ID", async () => {
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }

      const res = await api
        .get(`/artworks/user/${user.id}`)
        .expect(HttpStatus.OK);
      expect(res.body.artworks).toHaveLength(1);
      expect(res.body.artworks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            imageUri: "image_uri",
            originalFilename: "watercolor",
            contentType: "image/png",
            sizeBytes: 2543872,
            description: "Watercolor painting",
          }),
        ])
      );
    });
  });

  describe("GET /artworks/:id", () => {
    it("Should get specific artwork with ID", async () => {
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }
      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          imageUri: "image_uri",
          description: "Emma artwork",
        },
      });
      const res = await api
        .get(`/artworks/${artwork.id}`)
        .expect(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          imageUri: "image_uri",
          description: "Emma artwork",
        })
      );
    });

    it("Shouldn't get artwork with non-existent ID", async () => {
      const res = await api.get("/artworks/10").expect(HttpStatus.OK);
      expect(res.body).toEqual({});
    });
  });

  describe("PATCH /artworks/:id", () => {
    it("Should update specific artwork with ID", async () => {
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }
      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          imageUri: "image_uri",
          description: "Emma artwork 2",
        },
      });
      const res = await api
        .patch(`/artworks/${artwork.id}`)
        .send({
          description: "Black and white version",
        })
        .expect(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          imageUri: "image_uri",
          description: "Black and white version",
        })
      );
    });

    it("Shouldn't update specific artwork with non-existent ID", async () => {
      await api
        .patch("/artworks/1")
        .send({
          description: "New description",
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("DELETE /artworks/:id", () => {
    it("Should remove specific artwork with ID", async () => {
      const user = await prismaService.user.findUnique({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      if (!user) {
        fail("User emma.dao@mail.com should exist");
      }
      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          imageUri: "image_uri",
          description: "Emma artwork",
        },
      });
      await api.delete(`/artworks/${artwork.id}`).expect(HttpStatus.NO_CONTENT);
    });

    it("Shouldn't remove artwork with non-existent ID", async () => {
      await api.delete("/artworks/100").expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
