import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupApp } from "./app.setup";
import { ConfigService } from "@nestjs/config";
import "dotenv/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });
  
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT") || 8000;

  setupApp(app);
  await app.listen(port);
}
bootstrap();
