import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { InternalServerErrorDTO, API_PREFIX, API_DOCS_PATH } from "@vigilart/shared";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { PrismaClientExceptionFilter } from "./common/filters/prisma-client-exception.filter";
import { ZodExceptionFilter } from "./common/filters/zod-exception.filter";

export const setupApp = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || API_PREFIX;

  app.enableCors();
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(),
    new HttpExceptionFilter(),
    new ZodExceptionFilter()
  );

  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("VigilArt API")
      .setDescription(
        "Official API documentation for the VigilArt application."
      )
      .setVersion("0.0.1")
      .addBearerAuth()
      .addGlobalResponse({
        status: 500,
        type: InternalServerErrorDTO,
      })
      .build();
    const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(API_DOCS_PATH, app, cleanupOpenApiDoc(documentFactory));
  }
  return app;
};
