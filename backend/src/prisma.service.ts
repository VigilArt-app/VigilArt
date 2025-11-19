import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async resetDatabase() {
    const env = process.env.NODE_ENV;
    if (env !== "test") {
      throw new Error(
        `resetDatabase blocked: NODE_ENV must be "test" (received "${env}")`
      );
    }
    await this.user.deleteMany();
  }
}
