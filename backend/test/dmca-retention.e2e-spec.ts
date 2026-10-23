import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { DeviantArtDmcaFormJSON } from "@vigilart/shared";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { NOTICE_RETENTION_CRON } from "../src/dmca/notice/notice-retention.service";

describe("DMCA notice retention cron E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scheduler: SchedulerRegistry;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    scheduler = app.get(SchedulerRegistry);
    // Fire the registered job on demand instead of waiting for 3 AM.
    for (const job of scheduler.getCronJobs().values()) {
      await job.stop();
      job.waitForCompletion = true;
    }
    await prisma.dmcaPlatform.create({ data: DeviantArtDmcaFormJSON });
  });

  afterAll(async () => {
    await prisma.dmcaNotice.deleteMany();
    await prisma.dmcaPlatform.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  const notice = (userId: string | null, createdAt: Date) =>
    prisma.dmcaNotice.create({
      data: {
        userId,
        dmcaPlatformSlug: DeviantArtDmcaFormJSON.slug,
        createdAt,
        // What a kept notice still holds after the account is gone.
        payload: { contact_information: { full_name: "John Doe", email: "john.doe@vigilart.app" } }
      }
    });

  it("deletes notices of deleted accounts once they are 3 years old, and keeps the others", async () => {
    const artist = await prisma.user.create({
      data: { email: "live.artist@mail.com", password: "hashed" }
    });
    const expired = await notice(null, daysAgo(3 * 365 + 2));
    const recent = await notice(null, daysAgo(2 * 365));
    const liveAccount = await notice(artist.id, daysAgo(4 * 365));

    await scheduler.getCronJob(NOTICE_RETENTION_CRON).fireOnTick();

    const left = await prisma.dmcaNotice.findMany({ select: { id: true } });
    expect(left.map(({ id }) => id).sort()).toEqual([recent.id, liveAccount.id].sort());
    expect(left.map(({ id }) => id)).not.toContain(expired.id);
  });
});
