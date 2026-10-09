import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getQueueToken } from "@nestjs/bullmq";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Queue, QueueEvents } from "bullmq";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { StorageService } from "../src/storage/storage.service";
import { GoogleLensService } from "../src/googlelens/googlelens.service";
import { SerpApiLensService } from "../src/serpapilens/serpapilens.service";
import { VisionService } from "../src/vision/vision.service";
import { NotificationsService } from "../src/notifications/notifications.service";
import { REPORTS_QUEUE } from "../src/reports/reports.constants";
import { getTestContainerUrls } from "./setupTests.e2e";

describe("Registered automatic reports cron E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queue: Queue;
  let events: QueueEvents;
  let scheduler: SchedulerRegistry;
  const searchImage = jest.fn();

  beforeAll(async () => {
    // setupTests.e2e.ts supplies these URLs from disposable containers before
    // this hook. No development database or provider credentials are loaded.
    const { databaseUrl, redisUrl } = getTestContainerUrls();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({
        DATABASE_URL: databaseUrl,
        REDIS_URL: redisUrl,
        NODE_ENV: "test",
        JWT_SECRET: "scheduler-test-access-secret",
        JWT_REFRESH_SECRET: "scheduler-test-refresh-secret"
      }))
      .overrideProvider(StorageService)
      .useValue({
        getDownloadUrl: async (key: string) => `https://storage.invalid/${key}`
      })
      .overrideProvider(SerpApiLensService)
      .useValue({ searchImage })
      .overrideProvider(GoogleLensService)
      .useValue({ searchImage: async () => { throw new Error("Unexpected provider"); } })
      .overrideProvider(VisionService)
      .useValue({})
      .overrideProvider(NotificationsService)
      .useValue({ send: async () => undefined })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    queue = app.get<Queue>(getQueueToken(REPORTS_QUEUE));
    scheduler = app.get(SchedulerRegistry);
    events = new QueueEvents(REPORTS_QUEUE, {
      connection: { url: redisUrl }
    });
    await events.waitUntilReady();

    // Both current cron jobs are unnamed. Fire the registered callbacks on
    // demand, including harmless token cleanup in this disposable database.
    // Awaiting callbacks avoids a timing sleep; production timing is untouched.
    for (const job of scheduler.getCronJobs().values()) {
      await job.stop();
      job.waitForCompletion = true;
    }
  }, 120000);

  beforeEach(async () => {
    await queue.pause();
    searchImage.mockReset().mockImplementation(async (url: string) => ({
      metadata: { bestGuessLabels: [], webEntities: [] },
      matchingPages: [{
        url: `https://example.com/${new URL(url).pathname.slice(1)}`,
        category: "OTHER",
        websiteName: "example.com",
        unsafeDomain: false,
        imageUrl: "https://example.com/match.jpg",
        pageTitle: "Matched artwork"
      }]
    }));
  });

  afterEach(async () => {
    if (!queue || !prisma) return;
    await queue.pause();
    await queue.drain(true);
    await queue.clean(0, 100, "failed");
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await events?.close();
    await app?.close();
  });

  const createUser = async (label: string, autoRunReports: boolean) => {
    return prisma.user.create({
      data: {
        email: `${label}@scheduler.invalid`,
        password: "unused-test-password",
        firstName: "Cron",
        lastName: label,
        autoRunReports,
        artworks: {
          create: {
            originalFilename: `${label}.jpg`,
            storageKey: `artworks/${label}.jpg`,
            contentType: "image/jpeg",
            sizeBytes: 100,
            width: 10,
            height: 10
          }
        }
      },
      include: { artworks: true }
    });
  };

  const fireRegisteredCrons = async () => {
    const jobs = [...scheduler.getCronJobs().values()];
    expect(jobs.some((job) => job.cronTime.source === "0 0 * * *")).toBe(true);
    for (const job of jobs) await job.fireOnTick();
  };

  it("scans opted-in accounts with no recent report, persists matches, and skips a second tick", async () => {
    // Catches broken registration/worker wiring, inverted opt-in/window filters,
    // missing persistence and accidental re-enqueue of a newly scanned account.
    const first = await createUser("first", true);
    const overdue = await createUser("overdue", true);
    const disabled = await createUser("disabled", false);
    const recent = await createUser("recent", true);
    await prisma.artworksReport.create({
      data: {
        userId: overdue.id,
        detectionDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
      }
    });
    await prisma.artworksReport.create({ data: { userId: recent.id } });

    const startedAt = new Date();
    await fireRegisteredCrons();
    const queued = await queue.getJobs(["paused", "waiting"]);
    expect(queued.map((job) => job.data.userId).sort())
      .toEqual([first.id, overdue.id].sort());
    const finished = queued.map((job) => job.waitUntilFinished(events, 10000));
    await queue.resume();
    const reportIds = await Promise.all(finished);

    const reports = await prisma.artworksReport.findMany({
      where: { id: { in: reportIds } },
      include: { matchingPages: true }
    });
    expect(reports).toHaveLength(2);
    expect(reports.map((report) => report.userId).sort())
      .toEqual([first.id, overdue.id].sort());
    for (const user of [first, overdue]) {
      const report = reports.find((item) => item.userId === user.id)!;
      expect(report.detectionDate.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
      expect(report.matchingPages).toEqual([
        expect.objectContaining({
          artworkId: user.artworks[0].id,
          url: `https://example.com/artworks/${user.lastName}.jpg`
        })
      ]);
      const artwork = await prisma.artwork.findUniqueOrThrow({
        where: { id: user.artworks[0].id }
      });
      expect(artwork.lastScanAt!.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
    }
    expect(await prisma.artworksReport.count({ where: { userId: disabled.id } })).toBe(0);
    expect(await prisma.artworksReport.count({ where: { userId: recent.id } })).toBe(1);
    expect(await prisma.artwork.count({
      where: { userId: { in: [disabled.id, recent.id] }, lastScanAt: null }
    })).toBe(2);

    await queue.pause();
    await fireRegisteredCrons();
    expect(await queue.getJobs(["paused", "waiting", "active", "delayed"]))
      .toHaveLength(0);
    expect(await prisma.artworksReport.count()).toBe(4);
  });

  it("retries a failed provider scan without saving a misleading report or lastScanAt", async () => {
    // Catches provider failures being recorded as successful empty scans.
    const user = await createUser("provider-failure", true);
    await prisma.scanUsage.createMany({ data: [0, 1].map(() => ({ id: crypto.randomUUID(), userId: user.id })) });
    searchImage.mockRejectedValue(new Error("Test provider unavailable"));
    await fireRegisteredCrons();
    const queued = await queue.getJobs(["paused", "waiting"]);
    expect(queued.map((job) => job.data.userId)).toEqual([user.id]);
    const finished = queued[0].waitUntilFinished(events, 25000);
    // Install the rejection handler before the worker is resumed.
    const failure = expect(finished).rejects.toThrow("Scan failed:");
    await queue.resume();
    await failure;

    const failed = await queue.getJob(queued[0].id!);
    expect(await failed!.getState()).toBe("failed");
    expect(failed!.attemptsMade).toBe(3);
    expect(searchImage).toHaveBeenCalledTimes(3);
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(3);
    expect(await prisma.artworksReport.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.matchingPage.count()).toBe(0);
    const artwork = await prisma.artwork.findUniqueOrThrow({
      where: { id: user.artworks[0].id }
    });
    expect(artwork.lastScanAt).toBeNull();
  });
});
