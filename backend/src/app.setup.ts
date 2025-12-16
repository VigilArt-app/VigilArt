import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || "/api/v1";
  const swaggerConfig = new DocumentBuilder()
    .setTitle("VigilArt API")
    .setDescription("Official API documentation for the VigilArt application.")
    .setVersion("0.0.1")
    .build();
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);

  app.enableCors();
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );
  SwaggerModule.setup("api/v1/documentation", app, documentFactory);
  return app;
}
