import { PrismaClient } from "@vigilart/shared/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "../src/prisma/seeds/seed";
import { initialUsers } from "../src/prisma/seeds/add-users";

const testUserEmails = initialUsers.map(user => user.email);

describe("Database seeder", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.dmcaPlatform.deleteMany();
  });

  afterAll(async () => await prisma.$disconnect());

  it("Does not create the test accounts in production, but still seeds the DMCA platforms", async () => {
    await seedDatabase(prisma, "production");

    expect(await prisma.user.count({ where: { email: { in: testUserEmails } } })).toBe(0);
    expect(await prisma.dmcaPlatform.count({ where: { slug: { in: ["TUMBLR", "X"] } } })).toBe(2);
  });

  it("Creates the test accounts outside production", async () => {
    await seedDatabase(prisma, "development");

    expect(await prisma.user.count({ where: { email: { in: testUserEmails } } })).toBe(testUserEmails.length);
  });
});
