import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { InternalServerErrorClass } from "@vigilart/shared";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseWrapperInterceptor } from "./common/interceptors/response-wrapper.interceptor";
import { PrismaClientExceptionFilter } from "./common/filters/prisma-client-exception.filter";
import { HttpAdapterHost } from "@nestjs/core";

export function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || "/api/v1";
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.enableCors();
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
    new HttpExceptionFilter(httpAdapter)
  );
  app.useGlobalInterceptors(new ResponseWrapperInterceptor());

  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("VigilArt API")
      .setDescription("Official API documentation for the VigilArt application.")
      .setVersion("0.0.1")
      .addBearerAuth()
      .addGlobalResponse({
        status: 500,
        type: InternalServerErrorClass
      })
      .build();
    const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("api/v1/docs", app, cleanupOpenApiDoc(documentFactory));
  }
  return app;
}
