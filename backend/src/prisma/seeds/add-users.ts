import { SubscriptionTier } from "@vigilart/shared";
import { PrismaClient } from "@vigilart/shared/server";
import * as bcrypt from "bcrypt";

export const initialUsers = [
  {
    id: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    email: "ayaka_suda@gmail.com",
    password: bcrypt.hashSync("H4shed_password_", Number(process.env["SALT_ROUNDS"] || 10)),
    firstName: "Ayaka",
    lastName: "Suda",
    avatar: null,
    subscriptionTier: SubscriptionTier.FREE
  },
  {
    id: "49cb44a3-e6f9-4cd0-a7f8-292d5b3e5231",
    email: "amanda_rowles@gmail.com",
    password: bcrypt.hashSync("H4shed_password#", Number(process.env["SALT_ROUNDS"] || 10)),
    firstName: "Amanda",
    lastName: "Rowles",
    avatar: null,
    subscriptionTier: SubscriptionTier.FREE
  }
];

export const addUsers = async (prisma: PrismaClient): Promise<void> => {
  console.log(`Seeding ${initialUsers.length} users...`);
  await prisma.user.createMany({
    data: initialUsers,
    skipDuplicates: true
  });
};
