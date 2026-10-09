import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ForbiddenException, type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import request from "supertest";
import { getQueueToken } from "@nestjs/bullmq";
import { Queue, QueueEvents } from "bullmq";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { ArtworksService } from "../src/artworks/artworks.service";
import { ReportsService } from "../src/reports/reports.service";
import { StorageService } from "../src/storage/storage.service";
import { SerpApiLensService } from "../src/serpapilens/serpapilens.service";
import { GoogleLensService } from "../src/googlelens/googlelens.service";
import { VisionService } from "../src/vision/vision.service";
import { NotificationsService } from "../src/notifications/notifications.service";
import { REPORTS_QUEUE } from "../src/reports/reports.constants";
import { UserUpdateSchema } from "@vigilart/shared";
import { ScanQuotaService } from "../src/reports/scan-quota.service";
import { RedisService } from "../src/redis/redis.service";
import { PublicScanBudgetService } from "../src/public-scan/services/public-scan-budget.service";
import { setupApp } from "../src/app.setup";
import { Client } from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TurnstileService } from "../src/turnstile/turnstile.service";
import { getTestContainerUrls } from "./setupTests.e2e";

describe("Durable scan and artwork limits E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let artworks: ArtworksService;
  let reports: ReportsService;
  let queue: Queue;
  let events: QueueEvents;
  let quota: ScanQuotaService;
  const searchImage = jest.fn();
  const getDownloadUrl = jest.fn();
  const artworkData = (userId: string, label = crypto.randomUUID()) => ({
    userId, originalFilename: `${label}.jpg`, storageKey: `artworks/${label}.jpg`,
    contentType: "image/jpeg", sizeBytes: 10, width: 10, height: 10
  });
  const createUser = (subscriptionTier: "FREE" | "PRO" = "FREE") => prisma.user.create({
    data: { email: `${crypto.randomUUID()}@limits.invalid`, password: "unused",
      firstName: "Quota", lastName: "Test", subscriptionTier }
  });

  beforeAll(async () => {
    const { databaseUrl, redisUrl } = getTestContainerUrls();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService({ DATABASE_URL: databaseUrl,
        REDIS_URL: redisUrl, NODE_ENV: "test", API_PREFIX: "api/v1", JWT_SECRET: "limits-secret", JWT_REFRESH_SECRET: "limits-refresh" }))
      .overrideProvider(StorageService).useValue({ getDownloadUrl })
      .overrideProvider(SerpApiLensService).useValue({ searchImage })
      .overrideProvider(GoogleLensService).useValue({ searchImage: async () => { throw new Error("Unexpected provider"); } })
      .overrideProvider(VisionService).useValue({})
      .overrideProvider(TurnstileService).useValue({ verify: async () => true })
      .overrideProvider(NotificationsService).useValue({ send: async () => undefined })
      .compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    artworks = app.get(ArtworksService);
    reports = app.get(ReportsService);
    quota = app.get(ScanQuotaService);
    queue = app.get(getQueueToken(REPORTS_QUEUE));
    events = new QueueEvents(REPORTS_QUEUE, { connection: { url: redisUrl } });
    await events.waitUntilReady();
  }, 120000);
  beforeEach(() => {
    searchImage.mockReset().mockResolvedValue({ metadata: { bestGuessLabels: [], webEntities: [] }, matchingPages: [] });
    getDownloadUrl.mockReset().mockResolvedValue("https://storage.invalid/art.jpg");
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await queue.resume();
    await queue.drain(true);
    await queue.clean(0, 100, "completed");
    await queue.clean(0, 100, "failed");
    await prisma.user.deleteMany();
  });
  afterAll(async () => { await events?.close(); await app?.close(); });

  it("allows the third free scan and rejects the fourth", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    await reports.generate(user.id);
    await reports.generate(user.id);
    await reports.generate(user.id);
    await expect(reports.generate(user.id)).rejects.toMatchObject({ status: 403 });
    expect(await prisma.artworksReport.count({ where: { userId: user.id } })).toBe(3);
  });

  it("keeps the completed scan pollable when quota rejects both async and synchronous replacements", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    await reports.generate(user.id);
    await reports.generate(user.id);
    const { jobId } = await reports.enqueueScan(user.id);
    const job = await queue.getJob(jobId);
    expect(job).toBeDefined();
    const reportId = await job!.waitUntilFinished(events, 15000);
    const completedStatus = await reports.getScanStatus(user.id, jobId);
    expect(completedStatus).toMatchObject({ state: "completed", reportId });
    const token = app.get(JwtService).sign({ sub: user.id, email: user.email });

    for (const suffix of ["/scan", ""]) {
      await request(app.getHttpServer()).post(`/api/v1/reports/user/${user.id}${suffix}`)
        .auth(token, { type: "bearer" }).expect(403);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reports/user/${user.id}/scan/${jobId}`)
        .auth(token, { type: "bearer" }).expect(200);
      expect(response.body.data).toEqual(completedStatus);
    }

    expect(await prisma.artworksReport.findUnique({ where: { id: reportId } })).not.toBeNull();
    expect(await prisma.artworksReport.count({ where: { userId: user.id } })).toBe(3);
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(3);
    expect(searchImage).toHaveBeenCalledTimes(3);
  });

  it("returns 403, not 503, when the worker refuses a synchronous scan on quota, whatever the wording", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    // Preflight passes; the slot is taken by a concurrent scan before the worker consumes it.
    jest.spyOn(quota, "consumeScan").mockRejectedValue(new ForbiddenException("Scan allowance used up."));
    await expect(reports.generateAndWait(user.id)).rejects.toMatchObject({ status: 403, message: "Scan allowance used up." });
    expect(await prisma.artworksReport.count({ where: { userId: user.id } })).toBe(0);
  });

  it("answers 504 instead of hanging when a synchronous scan outlives its wait", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    searchImage.mockImplementation(async () => { await gate;
      return { metadata: { bestGuessLabels: [], webEntities: [] }, matchingPages: [] }; });
    await expect(reports.generateAndWait(user.id, 500)).rejects.toMatchObject({ status: 504 });
    // The scan itself keeps running and still saves its report.
    const job = (await queue.getJob(`scan-${user.id}`))!;
    release();
    await job.waitUntilFinished(events, 10000);
    expect(await prisma.artworksReport.count({ where: { userId: user.id } })).toBe(1);
  });

  it("shares one Redis event connection across concurrent synchronous scans", async () => {
    const users = await Promise.all([createUser(), createUser(), createUser()]);
    await Promise.all(users.map((user) => artworks.create(artworkData(user.id))));
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    searchImage.mockImplementation(async () => { await gate;
      return { metadata: { bestGuessLabels: [], webEntities: [] }, matchingPages: [] }; });
    const redis = app.get(RedisService);
    const connections = async () => (await redis.client("LIST") as string).trim().split("\n").length;
    const before = await connections();
    const scans = users.map((user) => reports.generateAndWait(user.id));
    while ((await queue.getJobs(["active", "waiting"])).length < users.length) await new Promise((done) => setTimeout(done, 20));
    const during = await connections();
    release();
    await Promise.all(scans);
    // Each extra connection counts against Redis maxclients for as long as the scan runs.
    expect(during - before).toBeLessThanOrEqual(1);
  });

  it("shows the quota while another request holds the account lock", async () => {
    const user = await createUser();
    const client = new Client({ connectionString: getTestContainerUrls().databaseUrl });
    await client.connect();
    try {
      // Same row lock an in-flight scan start or artwork upload holds.
      await client.query("BEGIN");
      await client.query('SELECT "id" FROM "User" WHERE "id" = $1 FOR UPDATE', [user.id]);
      const blocked = new Promise((_resolve, reject) => setTimeout(() => reject(new Error("quota read waited for the lock")), 2000));
      await expect(Promise.race([quota.getScanQuota(user.id), blocked]))
        .resolves.toEqual({ remaining: 3, limit: 3, nextAvailableAt: null });
    } finally {
      await client.query("ROLLBACK");
      await client.end();
    }
  });

  it("serializes concurrent artwork creation and accepts only five", async () => {
    const user = await createUser();
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => artworks.create(artworkData(user.id))));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(5);
    expect(await prisma.artwork.count({ where: { userId: user.id } })).toBe(5);
  });

  it("rejects a whole batch beyond five without inserting any partial artworks", async () => {
    const user = await createUser();
    await artworks.createMany(Array.from({ length: 4 }, () => artworkData(user.id)));
    await expect(artworks.createMany([artworkData(user.id), artworkData(user.id)])).rejects.toMatchObject({ status: 403 });
    expect(await prisma.artwork.count({ where: { userId: user.id } })).toBe(4);
    await artworks.create(artworkData(user.id));
    await expect(artworks.create(artworkData(user.id))).rejects.toMatchObject({ status: 403 });
  });

  it("strips subscription and unknown profile fields from the update DTO", () => {
    expect(UserUpdateSchema.parse({ firstName: "Ada", subscriptionTier: "PRO", country: "France", language: "fr" }))
      .toEqual({ firstName: "Ada" });
  });

  it("serializes concurrent scan starts and allows only three providers", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    const results = await Promise.allSettled(Array.from({ length: 6 }, () => reports.generate(user.id)));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(3);
    expect(results.filter((result) => result.status === "rejected").map((result) => (result as PromiseRejectedResult).reason.status)).toEqual([403, 403, 403]);
    expect(searchImage).toHaveBeenCalledTimes(3);
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(3);
  });

  it("keeps failed provider starts consumed, and retries the same queued UUID only once", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    await queue.pause();
    // Older queued jobs lack scanId: the first attempt persists it before searching.
    const job = await queue.add("generate-report", { userId: user.id }, { jobId: `scan-${user.id}` });
    searchImage.mockRejectedValue(new Error("provider unavailable"));
    await expect(reports.generate(user.id, job)).rejects.toMatchObject({ status: 503 });
    const persisted = await queue.getJob(job.id!);
    expect(persisted?.data.scanId).toMatch(/^[a-f0-9-]{36}$/);
    expect(await reports.getScanQuota(user.id)).toEqual({ remaining: 2, limit: 3, nextAvailableAt: null });
    searchImage.mockResolvedValue({ metadata: { bestGuessLabels: [], webEntities: [] }, matchingPages: [] });
    await reports.generate(user.id, persisted!);
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(1);
    await job.remove();
  });

  it("does not charge an empty account, failed storage URL or artwork-cap preflight", async () => {
    const user = await createUser();
    await expect(reports.generate(user.id)).rejects.toMatchObject({ status: 400 });
    await artworks.create(artworkData(user.id));
    getDownloadUrl.mockRejectedValue(new Error("storage unavailable"));
    await expect(reports.generate(user.id)).rejects.toMatchObject({ status: 503 });
    await prisma.artwork.createMany({ data: Array.from({ length: 5 }, () => artworkData(user.id)) });
    await expect(reports.generate(user.id)).rejects.toMatchObject({ status: 403 });
    await expect(artworks.create(artworkData(user.id))).rejects.toMatchObject({ status: 403 });
    expect(await prisma.artwork.count({ where: { userId: user.id } })).toBe(6);
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(0);
    expect(searchImage).not.toHaveBeenCalled();
  });

  it("expires scans exactly at 30 days and finds the correct next slot for excess history", async () => {
    const user = await createUser();
    const now = new Date("2026-10-02T12:00:00.000Z").getTime();
    jest.spyOn(Date, "now").mockReturnValue(now);
    await prisma.scanUsage.createMany({ data: [
      "2026-09-02T12:00:00.000Z", "2026-09-03T12:00:00.000Z", "2026-09-04T12:00:00.000Z",
      "2026-09-05T12:00:00.000Z", "2026-09-06T12:00:00.000Z"
    ].map((date) => ({ id: crypto.randomUUID(), userId: user.id, startedAt: new Date(date) })) });
    expect(await quota.getScanQuota(user.id)).toEqual({ remaining: 0, limit: 3, nextAvailableAt: "2026-10-04T12:00:00.000Z" });
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-10-04T12:00:00.000Z").getTime());
    expect(await quota.getScanQuota(user.id)).toEqual({ remaining: 1, limit: 3, nextAvailableAt: null });
  });

  it("leaves paid accounts unlimited in artworks and permits ten scans", async () => {
    const user = await createUser("PRO");
    await artworks.createMany(Array.from({ length: 6 }, () => artworkData(user.id)));
    expect(await quota.getScanQuota(user.id)).toEqual({ remaining: 10, limit: 10, nextAvailableAt: null });
    for (let index = 0; index < 10; index++) await quota.consumeScan(user.id, crypto.randomUUID());
    await expect(quota.consumeScan(user.id, crypto.randomUUID())).rejects.toMatchObject({ status: 403 });
    expect(await prisma.artwork.count({ where: { userId: user.id } })).toBe(6);
  });

  it("makes manual, cron and synchronous legacy calls share one active job and full report response", async () => {
    const user = await createUser();
    await artworks.create(artworkData(user.id));
    let release!: () => void;
    const started = new Promise<void>((resolve) => {
      searchImage.mockImplementationOnce(async () => { resolve(); await new Promise<void>((done) => { release = done; });
        return { metadata: { bestGuessLabels: [], webEntities: [] }, matchingPages: [] }; });
    });
    const token = app.get(JwtService).sign({ sub: user.id, email: user.email });
    const legacy = request(app.getHttpServer()).post(`/api/v1/reports/user/${user.id}`)
      .auth(token, { type: "bearer" }).expect(200).then((response) => response.body);
    await started;
    const manual = await reports.enqueueScan(user.id);
    await reports.enqueueScheduledScan(user.id);
    await reports.enqueueScan(user.id);
    release();
    const result = await legacy;
    expect(result).toMatchObject({ success: true, statusCode: 200,
      data: { userId: user.id, id: expect.any(String), detectionDate: expect.any(String) } });
    expect(manual.jobId).toBe(`scan-${user.id}`);
    expect(searchImage).toHaveBeenCalledTimes(1);
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(1);
  });

  it("protects quota ownership and rejects profile subscription upgrades through HTTP", async () => {
    const owner = await createUser();
    const other = await createUser();
    const token = app.get(JwtService).sign({ sub: owner.id, email: owner.email });
    await request(app.getHttpServer()).get(`/api/v1/reports/user/${other.id}/scan-quota`).auth(token, { type: "bearer" }).expect(403);
    await request(app.getHttpServer()).get(`/api/v1/reports/user/${owner.id}/scan-quota`).expect(401);
    const response = await request(app.getHttpServer()).get(`/api/v1/reports/user/${owner.id}/scan-quota`).auth(token, { type: "bearer" }).expect(200);
    expect(response.body.data).toEqual({ remaining: 3, limit: 3, nextAvailableAt: null });
    // Same body shape as the mobile profile page, plus a forged tier upgrade.
    await request(app.getHttpServer()).patch(`/api/v1/users/${owner.id}`).auth(token, { type: "bearer" })
      .send({ firstName: "Ada", lastName: "Lovelace", country: "France", language: "fr", subscriptionTier: "PRO" }).expect(200);
    expect(await prisma.user.findUniqueOrThrow({ where: { id: owner.id } }))
      .toMatchObject({ firstName: "Ada", lastName: "Lovelace", subscriptionTier: "FREE" });
    await artworks.createMany(Array.from({ length: 5 }, () => artworkData(owner.id)));
    await request(app.getHttpServer()).post("/api/v1/storage/artworks/upload-urls").auth(token, { type: "bearer" })
      .send({ filenames: ["sixth.jpg"], prefix: "artworks" }).expect(403);
  });

  it("backfills completed historical reports before enforcing quota after deployment", async () => {
    const user = await createUser();
    const dates = [1, 2, 3, 4].map((days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    await prisma.artworksReport.createMany({ data: dates.map((detectionDate) => ({ userId: user.id, detectionDate })) });
    // Re-run the generated migration only in the database owned by this test container.
    const client = new Client({ connectionString: getTestContainerUrls().databaseUrl });
    await client.connect();
    try {
      await client.query("BEGIN");
      await client.query('DROP TABLE "ScanUsage"');
      await client.query(readFileSync(join(__dirname, "../prisma/migrations/20261001233550_durable_scan_usage/migration.sql"), "utf8"));
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { await client.end(); }
    expect(await prisma.scanUsage.count({ where: { userId: user.id } })).toBe(4);
    expect(await quota.getScanQuota(user.id)).toEqual({ remaining: 0, limit: 3,
      nextAvailableAt: new Date(dates[2].getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() });
  });

  it("allows two anonymous requests per IP with a 30-day Redis window and rejects the third", async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const redis = app.get(RedisService);
    try {
      await request(app.getHttpServer()).post("/api/v1/public-scan").expect(400);
      await request(app.getHttpServer()).post("/api/v1/public-scan").expect(400);
      await request(app.getHttpServer()).post("/api/v1/public-scan").expect(429);
      const keys = await redis.keys("*");
      const ttls = await Promise.all(keys.map((key) => redis.pttl(key)));
      expect(ttls.some((ttl) => ttl > 29 * 24 * 60 * 60 * 1000 && ttl <= 30 * 24 * 60 * 60 * 1000)).toBe(true);
    } finally { process.env.NODE_ENV = previousEnv; }
  });

  it("reserves only 15 concurrent anonymous scans with blank env and refunds the exact original day", async () => {
    const redis = app.get(RedisService);
    const budget = new PublicScanBudgetService(redis, new ConfigService({ NODE_ENV: "production", PUBLIC_SCAN_DAILY_BUDGET: " " }));
    const dayKey = `public-scan:budget:${new Date().toISOString().slice(0, 10)}`;
    await redis.del(dayKey);
    const reservations = await Promise.all(Array.from({ length: 24 }, () => budget.reserve()));
    expect(reservations.filter(Boolean)).toHaveLength(15);
    expect(await budget.remainingToday()).toBe(0);
    expect(await redis.get(dayKey)).toBe("15");
    const previousDay = "public-scan:budget:2026-09-30";
    await redis.set(previousDay, "1");
    await budget.release(previousDay);
    expect(await redis.get(previousDay)).toBe("0");
    expect(await redis.get(dayKey)).toBe("15");
    await redis.del(previousDay);
    await budget.release(previousDay);
    expect(await redis.get(previousDay)).toBeNull();
    await redis.del(dayKey);
  });
});
