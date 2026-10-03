import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { setupApp } from "../app.setup";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("user API documentation in development", () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it("starts with documentation enabled and describes only the public user profile", async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        // Documentation discovery never calls user persistence.
        { provide: UsersService, useValue: {} },
        {
          provide: ConfigService,
          useValue: new ConfigService({ NODE_ENV: "development" }),
        },
      ],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();

    const { body } = await request(app.getHttpServer())
      .get("/api/v1/docs-json")
      .expect(200);
    const profile = body.components.schemas.UserGetDTO.properties;
    expect(profile).toHaveProperty("email");
    for (const field of ["password", "termsAcceptedAt", "termsVersion", "privacyVersion"]) {
      expect(profile).not.toHaveProperty(field);
    }
    for (const path of ["/api/v1/users/{id}", "/api/v1/users/email/{email}"]) {
      const response = body.paths[path].get.responses["200"].content["application/json"].schema;
      expect(response.allOf[1].properties.data).toEqual({
        $ref: "#/components/schemas/UserGetDTO",
      });
    }
  });
});
