import { PrismaClient } from "@vigilart/shared/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "./seed";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  await seedDatabase(prisma, process.env.NODE_ENV);
  console.log("✅ Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Could not seed the database");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
