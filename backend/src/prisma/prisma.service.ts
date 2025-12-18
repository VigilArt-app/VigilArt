import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    const databaseUrl = config.get<string>("DATABASE_URL");

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async resetDatabase() {
    const env = this.config.get<string>("NODE_ENV");
    if (env !== "test") {
      throw new Error(
        `resetDatabase blocked: NODE_ENV must be "test" (received "${env}")`
      );
    }
    await this.user.deleteMany();
  }
}
