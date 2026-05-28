import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer
} from "@testcontainers/postgresql";
import { execSync } from "child_process";
import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";

let postgresContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer(
    "postgres:16-alpine"
  ).start();

  const dbUrl = postgresContainer.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;

  redisContainer = await new RedisContainer("redis:7-alpine").start();
  process.env.REDIS_URL = redisContainer.getConnectionUrl();

  execSync("pnpm exec prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit"
  });

  console.log(`Connected to test DB: ${dbUrl}`);
});

afterAll(async () => {
  if (postgresContainer) {
    await postgresContainer.stop();
  }
  if (redisContainer) {
    await redisContainer.stop();
  }
});

jest.setTimeout(30000);
