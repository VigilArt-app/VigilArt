import { PrismaClient } from "@vigilart/shared/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { addUsers } from "./add-users";
import { seedPlatforms } from "./platforms";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  await addUsers(prisma);
  await seedPlatforms(prisma);
  console.log("✅ Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Could not seed the database");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
