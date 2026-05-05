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

describe("Artworks User Journey E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let api: ApiClient;
  let testUser: { email: string; password: string, id: string };
  let testUser2: { email: string; password: string, id: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();

    setupApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    api = new ApiClient(app);
    testUser = {
      email: "test.auth@mail.com",
      password: "Secure_P4ssword",
      id: ""
    };
    testUser2 = {
      email: "amanda.rawles@mail.com",
      password: "Hashed_P4ssword",
      id: ""
    };

    await api.signup(
      testUser.email,
      testUser.password,
      "Test",
      "User"
    );
    const user1Response = await api.login(testUser.email, testUser.password);
    testUser.id = user1Response.body.data.id;
    await api.logout();

    const user2 = await prismaService.user.create({
      data: {
        email: testUser2.email,
        password: testUser2.password,
        firstName: "Amanda",
        lastName: "Rawles",
        subscriptionTier: SubscriptionTier.FREE
      }
    });
    testUser2.id = user2.id;
  });

  afterAll(async () => {
    await prismaService.artwork.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
  });

  describe("Unauthenticated Access", () => {
    it("POST /artworks - Should return 401 when not authenticated", async () => {
      const res = await api
        .post("/artworks")
        .send({
          userId: testUser.id,
          storageKey: `artworks/${testUser.id}/test.jpg`,
          originalFilename: "test.jpg",
          contentType: "image/jpeg",
          sizeBytes: 81686,
          width: 900,
          height: 800
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("POST /artworks/batch - Should return 401 when not authenticated", async () => {
      const res = await api
        .post("/artworks/batch")
        .send([
          {
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/test.jpg`,
            originalFilename: "test.jpg",
            contentType: "image/jpeg",
            sizeBytes: 81686,
            width: 900,
            height: 800
          }
        ])
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("GET /artworks - Should return 401 when not authenticated", async () => {
      const res = await api.get("/artworks").expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("GET /artworks/user/:id - Should return 401 when not authenticated", async () => {
      const res = await api
        .get(`/artworks/user/${testUser.id}`)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("GET /artworks/:id - Should return 401 when not authenticated", async () => {
      const res = await api
        .get("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("PATCH /artworks/:id - Should return 401 when not authenticated", async () => {
      const res = await api
        .patch("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .send({ description: "New description" })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("DELETE /artworks/:id - Should return 401 when not authenticated", async () => {
      const res = await api
        .delete("/artworks/123e4567-e89b-12d3-a456-426614174000")
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });

    it("POST /artworks/delete/batch - Should return 401 when not authenticated", async () => {
      const res = await api
        .post("/artworks/delete/batch")
        .send({ ids: ["123e4567-e89b-12d3-a456-426614174000"] })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: expect.any(String),
        error: "Unauthorized"
      });
    });
  });

  describe("Authenticated Access", () => {
    beforeEach(async () => {
      await api.login(testUser.email, testUser.password);

      await prismaService.artwork.createMany({
        data: [
          {
            userId: testUser.id,
            originalFilename: "grey_haired_woman.jpg",
            storageKey: `artworks/${testUser.id}/grey_haired_woman2a5685a1-f4d0-428d-9c12-88a136777bdf.jpg`,
            sizeBytes: 81686,
            width: 900,
            height: 800,
            contentType: "image/jpeg",
            description: "Woman with grey hair"
          },
          {
            userId: testUser2.id,
            originalFilename: "woman_smiling_flower.jpg",
            sizeBytes: 81686,
            width: 900,
            height: 800,
            contentType: "image/jpeg",
            storageKey: `artworks/${testUser2.id}/woman_smiling_flower3fdc9208-3634-4804-8df7-d19cd426ca30.jpg`
          }
        ]
      });
    });

    afterEach(async () => {
      await prismaService.artwork.deleteMany();
      await api.logout();
    });

    describe("POST /artworks", () => {
      it("Should create an artwork - required fields only", async () => {
        const res = await api
          .post("/artworks")
          .send({
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
        const res = await api
          .post("/artworks")
          .send({
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
          .expect(HttpStatus.FORBIDDEN);

        expect(res.body).toEqual({
          success: false,
          statusCode: HttpStatus.FORBIDDEN,
          message: expect.any(String),
          error: "Forbidden"
        });
      });
    });

    describe("POST /artworks/batch", () => {
        it("Should create multiple artworks - required fields only", async () => {
        const res = await api
          .post("/artworks/batch")
          .send([
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
              originalFilename: "woman_flower_bouquet.jpg",
              contentType: "image/jpeg",
              sizeBytes: 81686,
              width: 900,
              height: 800
            },
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
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
                userId: testUser.id,
                originalFilename: "woman_flower_bouquet.jpg"
              },
              {
                id: expect.any(String),
                userId: testUser.id,
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
          userId: testUser.id,
          originalFilename: "woman_flower_bouquet.jpg",
          storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
          userId: testUser.id,
          storageKey: `artworks/${testUser.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
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
        const res = await api
          .post("/artworks/batch")
          .send([
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
              originalFilename: "woman_flower_bouquet.jpg",
              contentType: "image/jpeg",
              sizeBytes: 81686,
              width: 900,
              height: 800,
              description: "Woman holding a flower bouquet"
            },
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
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
                userId: testUser.id,
                originalFilename: "woman_flower_bouquet.jpg"
              },
              {
                id: expect.any(String),
                userId: testUser.id,
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
          userId: testUser.id,
          storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
          userId: testUser.id,
          storageKey: `artworks/${testUser.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
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
        const res = await api
          .post("/artworks/batch")
          .send([
            {
              storageKey:
                "artworks/userId/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg",
              sizeBytes: 81686,
              width: 900,
              height: 800,
              description: "Woman holding a flower bouquet"
            },
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
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
          message: expect.any(String)
        });
      });

      it("Shouldn't create batch if non-existent user id used", async () => {
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
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/watercolor0b54f19e-c7aa-4503-a0ae-bac353e975a9.jpg`,
              originalFilename: "watercolor.jpg",
              contentType: "image/jpeg",
              sizeBytes: 10381,
              width: 1000,
              height: 900,
              description: "Watercolor"
            }
          ])
          .expect(HttpStatus.FORBIDDEN);

        expect(res.body).toEqual({
          success: false,
          statusCode: HttpStatus.FORBIDDEN,
          message: expect.any(String),
          error: "Forbidden"
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
        const res = await api
          .get(`/artworks/user/${testUser.id}`)
          .expect(HttpStatus.OK);

        expect(res.body).toEqual({
          success: true,
          statusCode: HttpStatus.OK,
          message: "OK",
          data: [
            {
              id: expect.any(String),
              userId: testUser.id,
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
          .expect(HttpStatus.FORBIDDEN);

        expect(res.body).toEqual({
          success: false,
          statusCode: HttpStatus.FORBIDDEN,
          message: expect.any(String),
          error: "Forbidden"
        });
      });
    });

    describe("GET /artworks/:id", () => {
      it("Should get specific artwork with ID", async () => {
        const artwork = await prismaService.artwork.create({
          data: {
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
          .expect(HttpStatus.FORBIDDEN);

        expect(res.body).toEqual({
          success: false,
          statusCode: HttpStatus.FORBIDDEN,
          message: expect.any(String),
          error: "Forbidden"
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
        const artwork = await prismaService.artwork.create({
          data: {
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
        const artwork = await prismaService.artwork.create({
          data: {
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg`,
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
        const artworks = await prismaService.artwork.createManyAndReturn({
          data: [
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/new_artwork00286021-8a57-4b39-bdc0-d741c08b1241.jpg`,
              originalFilename: "new_artwork.jpg",
              contentType: "image/jpeg",
              sizeBytes: 81686,
              width: 900,
              height: 800,
              description: "New artwork"
            },
            {
              userId: testUser.id,
              storageKey: `artworks/${testUser.id}/new_artwork00286021-8a57-4b39-bdc0-d741c08b1241.jpg`,
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
        const artwork = await prismaService.artwork.create({
          data: {
            userId: testUser.id,
            storageKey: `artworks/${testUser.id}/new_artwork00286021-8a57-4b39-bdc0-d741c08b1241.jpg`,
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
  });

  describe("Authorization Tests", () => {
    let user2Artwork: any;

    beforeEach(async () => {
      await api.login(testUser.email, testUser.password);

      user2Artwork = await prismaService.artwork.create({
        data: {
          userId: testUser2.id,
          originalFilename: "user2_artwork.jpg",
          storageKey: `artworks/${testUser2.id}/user2_artwork12345678-1234-1234-1234-123456789012.jpg`,
          sizeBytes: 81686,
          width: 900,
          height: 800,
          contentType: "image/jpeg",
          description: "User 2's private artwork"
        }
      });
    });

    afterEach(async () => {
      await prismaService.artwork.deleteMany();
      await api.logout();
    });

    it("GET /artworks/user/:id - Should return 403 when trying to access another user's artworks list", async () => {
      const res = await api
        .get(`/artworks/user/${testUser2.id}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("GET /artworks/:id - Should return 404 when trying to access another user's artwork (security by obscurity)", async () => {
      const res = await api
        .get(`/artworks/${user2Artwork.id}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("PATCH /artworks/:id - Should return 404 when trying to update another user's artwork (security by obscurity)", async () => {
      const res = await api
        .patch(`/artworks/${user2Artwork.id}`)
        .send({ description: "Trying to update" })
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("DELETE /artworks/:id - Should return 404 when trying to delete another user's artwork (security by obscurity)", async () => {
      const res = await api
        .delete(`/artworks/${user2Artwork.id}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(res.body).toEqual({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.any(String),
        error: "Forbidden"
      });
    });

    it("POST /artworks/delete/batch - Should only delete owned artworks in batch", async () => {
      const ownArtwork = await prismaService.artwork.create({
        data: {
          userId: testUser.id,
          originalFilename: "own_artwork.jpg",
          storageKey: `artworks/${testUser.id}/own_artwork12345678-1234-1234-1234-123456789012.jpg`,
          sizeBytes: 81686,
          width: 900,
          height: 800,
          contentType: "image/jpeg"
        }
      });

      const res = await api
        .post("/artworks/delete/batch")
        .send({
          ids: [ownArtwork.id, user2Artwork.id]
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

      const remainingArtworks = await prismaService.artwork.findMany();
      expect(remainingArtworks.length).toBe(1);
      expect(remainingArtworks[0].id).toBe(user2Artwork.id);
    });
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
  });
});
