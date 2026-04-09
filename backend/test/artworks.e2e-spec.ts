import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { SubscriptionTier } from "@vigilart/shared/enums";

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        close: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue(undefined)
      };
    }),
    GetObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    DeleteObjectsCommand: jest.fn()
  };
});

describe("Artworks E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let api: ApiClient;

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
    const user = await prismaService.user.create({
      data: {
        email: "emma.dao@mail.com",
        password: "Hashed_P4ssword",
        firstName: "Emma",
        lastName: "Dao",
        subscriptionTier: SubscriptionTier.FREE
      }
    });
    const user2 = await prismaService.user.create({
      data: {
        email: "amanda.rawles@mail.com",
        password: "Hashed_P4ssword",
        firstName: "Amanda",
        lastName: "Rawles",
        subscriptionTier: SubscriptionTier.FREE
      }
    });
    await prismaService.artwork.createMany({
      data: [
        {
          userId: user.id,
          originalFilename: "grey_haired_woman.jpg",
          storageKey: `artworks/${user.id}/grey_haired_woman2a5685a1-f4d0-428d-9c12-88a136777bdf.jpg`,
          sizeBytes: 81686,
          width: 900,
          height: 800,
          contentType: "image/jpeg",
          description: "Woman with grey hair"
        },
        {
          userId: user2.id,
          originalFilename: "woman_smiling_flower.jpg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          contentType: "image/jpeg",
          storageKey: `artworks/${user2.id}/woman_smiling_flower3fdc9208-3634-4804-8df7-d19cd426ca30.jpg`
        }
      ]
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
          email: "emma.dao@mail.com"
        }
      });

      const res = await api
        .post("/artworks")
        .send({
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          id: expect.any(String),
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          lastScanAt: null,
          description: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });
    });

    it("Should create an artwork - with optional fields", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const res = await api
        .post("/artworks")
        .send({
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet"
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          id: expect.any(String),
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null
        }
      });
    });

    it("Shouldn't create an artwork when required fields are missing", async () => {
      const res = await api
        .post("/artworks")
        .send({
          storageKey:
            "artworks/userId/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg",
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet"
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request",
      });
    });

    it("Shouldn't create an artwork if non-existent user id", async () => {
      const res = await api
        .post("/artworks")
        .send({
          userId: "123e4567-e89b-12d3-a456-426614174000",
          storageKey:
            "artworks/123e4567-e89b-12d3-a456-426614174000/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg",
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet"
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
        error: "Not Found"
      });
    });
  });

  describe("POST /artworks/batch", () => {
    it("Should create multiple artworks - required fields only", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const res = await api
        .post("/artworks/batch")
        .send([
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
            originalFilename: "woman_flower_bouquet.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800
          },
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
            originalFilename: "watercolor.jpg",
            contentType: "image/jpeg",
            sizeBytes: 10381,
            width: 1000,
            height: 900
          }
        ])
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          count: 2,
          artworks: [
            {
              id: expect.any(String),
              userId: user.id,
              originalFilename: "woman_flower_bouquet.jpg"
            },
            {
              id: expect.any(String),
              userId: user.id,
              originalFilename: "watercolor.jpg"
            }
          ]
        }
      });
      const artwork1 = await prismaService.artwork.findUnique({
        where: {
          id: res.body.data.artworks[0].id
        }
      });
      const artwork2 = await prismaService.artwork.findUnique({
        where: {
          id: res.body.data.artworks[1].id
        }
      });
      expect(artwork1).toEqual({
        id: expect.any(String),
        userId: user.id,
        originalFilename: "woman_flower_bouquet.jpg",
        storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
        contentType: "image/jpeg",
        sizeBytes: 81686,
        width: 900,
        height: 800,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        lastScanAt: null,
        description: null
      });
      expect(artwork2).toEqual({
        id: expect.any(String),
        userId: user.id,
        storageKey: `artworks/${user.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
        originalFilename: "watercolor.jpg",
        contentType: "image/jpeg",
        sizeBytes: 10381,
        width: 1000,
        height: 900,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        lastScanAt: null,
        description: null
      });
    });

    it("Should create multiple artworks - with optional fields", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const res = await api
        .post("/artworks/batch")
        .send([
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
            originalFilename: "woman_flower_bouquet.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800,
            description: "Woman holding a flower bouquet"
          },
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
            originalFilename: "watercolor.jpg",
            contentType: "image/jpeg",
            sizeBytes: 10381,
            width: 1000,
            height: 900,
            description: "Watercolor"
          }
        ])
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Created",
        data: {
          count: 2,
          artworks: [
            {
              id: expect.any(String),
              userId: user.id,
              originalFilename: "woman_flower_bouquet.jpg"
            },
            {
              id: expect.any(String),
              userId: user.id,
              originalFilename: "watercolor.jpg"
            }
          ]
        }
      });
      const artwork1 = await prismaService.artwork.findUnique({
        where: {
          id: res.body.data.artworks[0].id
        }
      });
      const artwork2 = await prismaService.artwork.findUnique({
        where: {
          id: res.body.data.artworks[1].id
        }
      });
      expect(artwork1).toEqual({
        id: expect.any(String),
        userId: user.id,
        storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
        originalFilename: "woman_flower_bouquet.jpg",
        contentType: "image/jpeg",
        sizeBytes: 81686,
        width: 900,
        height: 800,
        description: "Woman holding a flower bouquet",
        lastScanAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
      expect(artwork2).toEqual({
        id: expect.any(String),
        userId: user.id,
        storageKey: `artworks/${user.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
        originalFilename: "watercolor.jpg",
        contentType: "image/jpeg",
        sizeBytes: 10381,
        width: 1000,
        height: 900,
        description: "Watercolor",
        lastScanAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it("Shouldn't create batch when required fields of an artwork are missing", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const res = await api
        .post("/artworks/batch")
        .send([
          {
            storageKey:
              "artworks/userId/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg",
            originalFilename: "woman_flower_bouquet.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800,
            description: "Woman holding a flower bouquet"
          },
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
            originalFilename: "watercolor.jpg",
            contentType: "image/jpeg",
            sizeBytes: 10381,
            width: 1000,
            height: 900,
            description: "Watercolor"
          }
        ])
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Bad Request",
        message: "0.userId: User id is required.",
      });
    });

    it("Shouldn't create batch if non-existent user id used", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const res = await api
        .post("/artworks/batch")
        .send([
          {
            userId: "123e4567-e89b-12d3-a456-426614174000",
            storageKey:
              "artworks/123e4567-e89b-12d3-a456-426614174000/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg",
            originalFilename: "woman_flower_bouquet.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800,
            description: "Woman holding a flower bouquet"
          },
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
            originalFilename: "watercolor.jpg",
            contentType: "image/jpeg",
            sizeBytes: 10381,
            width: 1000,
            height: 900,
            description: "Watercolor"
          }
        ])
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: "User does not exist",
        error: "Not Found"
      });
    });
  });

  describe("GET /artworks", () => {
    it("Should get all artworks", async () => {
      const res = await api.get("/artworks").expect(HttpStatus.OK);
      const expectedArtworks = [
        {
          id: expect.any(String),
          userId: expect.any(String),
          originalFilename: "grey_haired_woman.jpg",
          storageKey: expect.any(String),
          sizeBytes: 81686,
          width: 900,
          height: 800,
          contentType: "image/jpeg",
          description: "Woman with grey hair",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null
        },
        {
          id: expect.any(String),
          userId: expect.any(String),
          originalFilename: "woman_smiling_flower.jpg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          contentType: "image/jpeg",
          storageKey: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null,
          description: null
        }
      ];

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: expectedArtworks
      });
    });
  });

  describe("GET /artworks/user/:id", () => {
    it("Should get all artworks for user with specific ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });
      const res = await api
        .get(`/artworks/user/${user.id}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: [
          {
            id: expect.any(String),
            userId: user.id,
            originalFilename: "grey_haired_woman.jpg",
            storageKey: expect.any(String),
            sizeBytes: 81686,
            width: 900,
            height: 800,
            contentType: "image/jpeg",
            description: "Woman with grey hair",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            lastScanAt: null
          }
        ]
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .get("/artworks/user/1")
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request"
      });
    });
  });

  describe("GET /artworks/:id", () => {
    it("Should get specific artwork with ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet"
        }
      });
      const res = await api
        .get(`/artworks/${artwork.id}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          id: expect.any(String),
          userId: expect.any(String),
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null
        }
      });
    });

    it("Shouldn't get artwork with non-existent ID", async () => {
      const res = await api
        .get("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
        error: "Not Found"
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api.get("/artworks/1").expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request"
      });
    });
  });

  describe("PATCH /artworks/:id", () => {
    it("Should update specific artwork with ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet"
        }
      });
      const res = await api
        .patch(`/artworks/${artwork.id}`)
        .send({
          description: "Black and white version"
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          id: expect.any(String),
          userId: expect.any(String),
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Black and white version",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastScanAt: null
        }
      });
    });

    it("Shouldn't update specific artwork with non-existent ID", async () => {
      const res = await api
        .patch("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .send({
          description: "New description"
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
        error: "Not Found"
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .patch("/artworks/1")
        .send({
          description: "Black and white version"
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

  describe("DELETE /artworks/:id", () => {
    it("Should remove specific artwork with ID", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          storageKey: `artworks/${user.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
          originalFilename: "woman_flower_bouquet.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "Woman holding a flower bouquet"
        }
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
        message: expect.any(String),
        error: "Not Found"
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .delete("/artworks/1")
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
        error: "Bad Request"
      });
    });
  });

  describe("POST /artworks/delete/batch", () => {
    it("Should remove artworks using their IDs", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const artworks = await prismaService.artwork.createManyAndReturn({
        data: [
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/new_artwork00286021-8a57-4b39-bdc0-d741c08b1241.jpg`,
            originalFilename: "new_artwork.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800,
            description: "New artwork"
          },
          {
            userId: user.id,
            storageKey: `artworks/${user.id}/new_artwork00286021-8a57-4b39-bdc0-d741c08b1241.jpg`,
            originalFilename: "new_artwork2.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800,
            description: "New artwork 2"
          }
        ]
      });
      const res = await api
        .post("/artworks/delete/batch")
        .send({
          ids: artworks.map((artwork) => artwork.id)
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          count: 2
        }
      });
    });

    it("Shouldn't remove batch if a non-existent artwork ID is specified", async () => {
      const user = await prismaService.user.findUniqueOrThrow({
        where: {
          email: "emma.dao@mail.com"
        }
      });

      const artwork = await prismaService.artwork.create({
        data: {
          userId: user.id,
          storageKey: `artworks/${user.id}/new_artwork00286021-8a57-4b39-bdc0-d741c08b1241.jpg`,
          originalFilename: "new_artwork.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800,
          description: "New artwork"
        }
      });
      const res = await api
        .post("/artworks/delete/batch")
        .send({
          ids: [artwork.id, "17e225bf-eaa6-4f31-9956-9892f93a0d23"]
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: "OK",
        data: {
          count: 1
        }
      });
    });

    it("Should expect an UUID", async () => {
      const res = await api
        .post("/artworks/delete/batch")
        .send({ ids: ["id"] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Bad Request",
        message: "ids.0: Invalid UUID"
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
