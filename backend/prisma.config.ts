import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "pnpm dlx tsx src/prisma/seeds/index.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL!
  }
});
