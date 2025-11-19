import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("API_PREFIX") || "/api/v1";

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );
  return app;
}
