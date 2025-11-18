import { INestApplication, ValidationPipe } from "@nestjs/common";

export const API_PREFIX = "/api/v1";

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );
  return app;
}
