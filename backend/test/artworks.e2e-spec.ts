import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier } from "@vigilart/shared/enums";

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
    await prismaService.artwork.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe("POST /artworks", () => {
    it("Should create an artwork - required fields only", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      const res = await api
        .post("/artworks")
        .send({
          userId: user.id,
          imageUri: "image_uri",
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Data created successfully.",
        data: {
          id: expect.any(String),
          userId: user.id,
          imageUri: "image_uri",
          contentType: null,
          description: null,
          lastScanAt: null,
          originalFilename: null,
          sizeBytes: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it("Should create an artwork - with optional fields", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com",
        },
      });

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

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Data created successfully.",
        data: {
          id: expect.any(String),
          userId: user.id,
          imageUri: "image_uri",
          originalFilename: "watercolor",
          contentType: "image/png",
          sizeBytes: 2543872,
          description: "Watercolor painting",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null,
        },
      });
    });

    it("Shouldn't create an artwork when required fields are missing", async () => {
      const res = await api
        .post("/artworks")
        .send({ imageUri: "image_uri" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed",
        error: "User id is required.",
      });
    });

    it("Shouldn't create an artwork if non-existent user id", async () => {
      const res = await api
        .post("/artworks")
        .send({
          userId: "123e4567-e89b-12d3-a456-426614174000",
          imageUri: "image_uri",
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: "User does not exist",
        error: "Not Found",
      });
    });
  });

  describe("GET /artworks", () => {
    it("Should get all artworks", async () => {
      const res = await api.get("/artworks").expect(HttpStatus.OK);
      const expectedArtworks = [
        {
          id: expect.any(String),
          imageUri: "image_uri",
          userId: expect.any(String),
          originalFilename: "watercolor",
          contentType: "image/png",
          sizeBytes: 2543872,
          description: "Watercolor painting",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null,
        },
        {
          id: expect.any(String),
          imageUri: "image_uri_drawing",
          userId: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          contentType: null,
          description: null,
          lastScanAt: null,
          originalFilename: null,
          sizeBytes: null,
        },
      ];

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "Request successful.",
        data: expectedArtworks,
      });
    });
  });

  describe("GET /artworks/user/:id", () => {
    it("Should get all artworks for user with specific ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com",
        },
      });
      const res = await api
        .get(`/artworks/user/${user.id}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "Request successful.",
        data: [
          {
            id: expect.any(String),
            imageUri: "image_uri",
            userId: expect.any(String),
            originalFilename: "watercolor",
            contentType: "image/png",
            sizeBytes: 2543872,
            description: "Watercolor painting",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            lastScanAt: null,
          },
        ],
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .get("/artworks/user/1")
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed (uuid is expected)",
        error: "Bad Request",
      });
    });
  });

  describe("GET /artworks/:id", () => {
    it("Should get specific artwork with ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com",
        },
      });

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

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "Request successful.",
        data: {
          id: expect.any(String),
          userId: expect.any(String),
          imageUri: "image_uri",
          description: "Emma artwork",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          contentType: null,
          lastScanAt: null,
          originalFilename: null,
          sizeBytes: null,
        },
      });
    });

    it("Shouldn't get artwork with non-existent ID", async () => {
      const res = await api
        .get("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: "Artwork not found",
        error: "Not Found",
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api.get("/artworks/1").expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed (uuid is expected)",
        error: "Bad Request",
      });
    });
  });

  describe("PATCH /artworks/:id", () => {
    it("Should update specific artwork with ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com",
        },
      });

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

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "Request successful.",
        data: {
          id: expect.any(String),
          userId: expect.any(String),
          imageUri: "image_uri",
          description: "Black and white version",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          contentType: null,
          lastScanAt: null,
          originalFilename: null,
          sizeBytes: null,
        },
      });
    });

    it("Shouldn't update specific artwork with non-existent ID", async () => {
      const res = await api
        .patch("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .send({
          description: "New description",
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: "Artwork not found",
        error: "Not Found",
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .patch("/artworks/1")
        .send({
          description: "Black and white version",
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed (uuid is expected)",
        error: "Bad Request",
      });
    });
  });

  describe("DELETE /artworks/:id", () => {
    it("Should remove specific artwork with ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com",
        },
      });

      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          imageUri: "image_uri",
          description: "Emma artwork",
        },
      });
      const res = await api
        .delete(`/artworks/${artwork.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(res.body).toEqual({});
    });

    it("Shouldn't remove artwork with non-existent ID", async () => {
      const res = await api
        .delete("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: "Artwork not found",
        error: "Not Found",
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .delete("/artworks/1")
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed (uuid is expected)",
        error: "Bad Request",
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
