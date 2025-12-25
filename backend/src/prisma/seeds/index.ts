import { PrismaClient } from "@vigilart/shared/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { initialUsers, initialArtworks } from "./seed-db";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  for (const artist of initialUsers) {
    await prisma.user.create({
      data: artist,
    });
  }
  for (const artwork of initialArtworks) {
    await prisma.artwork.create({
      data: artwork,
    });
  }
  console.log("✅ Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Could not seed the database");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
