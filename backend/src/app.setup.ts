import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || "/api/v1";

  app.enableCors();
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );

  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("VigilArt API")
      .setDescription("Official API documentation for the VigilArt application.")
      .setVersion("0.0.1")
      .addBearerAuth()
      .addGlobalResponse({
        status: 500,
        description: "Internal Server Error",
      })
      .build();
    const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("api/v1/docs", app, documentFactory);
  }
  return app;
}
