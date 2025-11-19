import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupApp } from "./app.setup";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT") || 8000;

  setupApp(app);
  await app.listen(port);
}
bootstrap();
