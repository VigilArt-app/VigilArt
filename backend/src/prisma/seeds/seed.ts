import { PrismaClient } from "@vigilart/shared/server";
import { addUsers } from "./add-users";
import { seedPlatforms } from "./platforms";

export const seedDatabase = async (prisma: PrismaClient, nodeEnv: string | undefined): Promise<void> => {
  // These accounts have passwords committed in add-users.ts: never create them on a deployed server.
  if (nodeEnv === "production") console.log("Skipping test users (NODE_ENV=production).");
  else await addUsers(prisma);
  await seedPlatforms(prisma);
};
