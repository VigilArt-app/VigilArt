import { Module } from "@nestjs/common";

import { AppService } from "./app.service";

import { AppController } from "./app.controller";

import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { VisionModule } from "./vision/vision.module";
import { ArtworksModule } from "./artworks/artworks.module";
import { ReportsModule } from "./reports/reports.module";
import { PrismaModule } from "./prisma/prisma.module";
import { StorageModule } from "./storage/storage.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env"
    }),
    UsersModule,
    AuthModule,
    VisionModule,
    ArtworksModule,
    ReportsModule,
    PrismaModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ]
})
export class AppModule {}
