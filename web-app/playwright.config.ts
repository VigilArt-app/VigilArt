import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3011", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: "pnpm exec dotenv -e ../.env -- pnpm exec next dev --port 3011",
    url: "http://127.0.0.1:3011/sign-up",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
