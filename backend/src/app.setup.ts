import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { InternalServerErrorDTO, API_PREFIX, API_DOCS_PATH } from "@vigilart/shared";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { PrismaClientExceptionFilter } from "./common/filters/prisma-client-exception.filter";
import { ZodExceptionFilter } from "./common/filters/zod-exception.filter";
import cookieParser from "cookie-parser";
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

  // Behind Cloudflare, every request reaches the container from the proxy's own
  // address. Without this, req.ip is that address and all rate limiting collapses
  // into one bucket shared by the entire internet. The value is a hop count, not
  // `true`: trusting every hop would let a client spoof its own IP by sending an
  // X-Forwarded-For header of its choosing.
  const trustProxyHops = Number(
    configService.get<string>("TRUST_PROXY_HOPS") ?? (isProd ? "1" : "0")
  );
  if (Number.isFinite(trustProxyHops) && trustProxyHops > 0) {
    (app as NestExpressApplication).set("trust proxy", trustProxyHops);
  }

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
    origin: corsOrigins?.length ? corsOrigins : !isProd,
    credentials: true
  });
  app.use(cookieParser());
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
