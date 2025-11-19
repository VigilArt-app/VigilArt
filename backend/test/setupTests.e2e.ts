import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";

let postgresContainer: StartedPostgreSqlContainer;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer(
    "postgres:16-alpine"
  ).start();

  const dbUrl = postgresContainer.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });

  console.log(`Connected to test DB: ${dbUrl}`);
});

afterAll(async () => {
  if (postgresContainer) {
    await postgresContainer.stop();
  }
});

jest.setTimeout(30000);
