import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { fork } from "node:child_process";
import { AppModule } from "./app.module";
import { setupApp } from "./app.setup";
import { ConfigService } from "@nestjs/config";

const logger = new Logger("Bootstrap");

// Runs the BullMQ scan worker (+ cron scheduler) with no HTTP server. Used as
// the forked child of an APP_ROLE=api process. The Redis worker connection and
// cron timers keep the event loop alive, so the process stays up.
async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  logger.log("Scan worker process started (APP_ROLE=worker).");
}

// Forks a child running this same bundle as the scan worker and restarts it if
// it dies (e.g. OOM mid-scan). Keeping the worker in a child process means a
// scan crash can never take the HTTP API down — it just fails that job.
function superviseWorker() {
  const child = fork(process.argv[1], [], {
    env: { ...process.env, APP_ROLE: "worker" }
  });
  child.on("exit", (code, signal) => {
    logger.warn(
      `Scan worker exited (code=${code ?? "null"}, signal=${signal ?? "null"}); restarting in 2s.`
    );
    setTimeout(superviseWorker, 2000);
  });
  child.on("error", (err) => {
    logger.error(`Failed to fork scan worker: ${err.message}`);
  });
}

async function bootstrapApi() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT") || 8000;

  setupApp(app);
  await app.listen(port);

  // Only when explicitly split (APP_ROLE=api, set via Doppler on deployed envs)
  // do we run the worker out of process. With APP_ROLE unset the worker stays
  // in-process (see reports.module.ts) — unchanged behavior for local/dev/tests.
  if (process.env.APP_ROLE === "api") {
    superviseWorker();
  }
}

async function bootstrap() {
  if (process.env.APP_ROLE === "worker") {
    await bootstrapWorker();
  } else {
    await bootstrapApi();
  }
}
bootstrap();
