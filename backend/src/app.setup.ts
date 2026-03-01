import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { InternalServerErrorDTO } from "@vigilart/shared/schemas";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseWrapperInterceptor } from "./common/interceptors/response-wrapper.interceptor";
import { PrismaClientExceptionFilter } from "./common/filters/prisma-client-exception.filter";
import { HttpAdapterHost } from "@nestjs/core";
import cookieParser from "cookie-parser";

export const setupApp = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || "/api/v1";
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.use(cookieParser());

  app.enableCors({
    origin: configService.get<string>("CORS_ORIGINS")?.split(",") || true,
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(
    new HttpExceptionFilter(httpAdapter),
    new PrismaClientExceptionFilter(httpAdapter)
  );
  app.useGlobalInterceptors(new ResponseWrapperInterceptor());

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
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

    SwaggerModule.setup("api/v1/docs", app, cleanupOpenApiDoc(documentFactory));
  }
  return app;
};
