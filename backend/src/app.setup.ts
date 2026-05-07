import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { InternalServerErrorDTO, API_PREFIX, API_DOCS_PATH } from "@vigilart/shared";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { PrismaClientExceptionFilter } from "./common/filters/prisma-client-exception.filter";
import { ZodExceptionFilter } from "./common/filters/zod-exception.filter";
import helmet from "helmet";

export const setupApp = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || API_PREFIX;
  const nodeEnv = configService.get<string>("NODE_ENV");
  const corsOrigins = configService.get<string>("CORS_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isProd = nodeEnv === "production";

  app.use(helmet({
    hsts: isProd,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'upgrade-insecure-requests': isProd ? [] : null,
      }
    }
  }));
  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : false
  });
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(),
    new HttpExceptionFilter(),
    new ZodExceptionFilter()
  );

  if (
    !isProd &&
    nodeEnv !== "test"
  ) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("VigilArt API")
      .setDescription(
        "Official API documentation for the VigilArt application."
      )
      .setVersion("0.1.0")
      .addBearerAuth()
      .addGlobalResponse({
        status: 500,
        type: InternalServerErrorDTO
      })
      .build();
    const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(API_DOCS_PATH, app, cleanupOpenApiDoc(documentFactory));
  }
  return app;
}
