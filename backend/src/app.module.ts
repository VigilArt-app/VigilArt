import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { VisionModule } from "./vision/vision.module";
import { ArtworksModule } from "./artworks/artworks.module";
import { ReportsModule } from "./reports/reports.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
    }),
    UsersModule,
    AuthModule,
    VisionModule,
    ArtworksModule,
    ReportsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
