import { SubscriptionTier } from "@vigilart/shared";
import { PrismaClient } from "@vigilart/shared/server";

export const initialArtworks = [
  {
    id: "c0c2bf8e-fdae-4da6-a8ce-eff2059676cb",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    imageUri:
      "https://i.pinimg.com/1200x/ea/e3/17/eae317bf285c3d834d72e5e386cd6ec3.jpg",
    originalFilename: null,
    contentType: null,
    sizeBytes: null,
    description: "Pearl OC",
    lastScanAt: null,
  },
  {
    id: "7570d89a-2dc4-440f-bdbb-c1747f4e779d",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    imageUri:
      "https://i.pinimg.com/1200x/91/6d/53/916d536e560e0c783e4134300ae0ac6f.jpg",
    originalFilename: null,
    contentType: null,
    sizeBytes: null,
    description: "Bloom",
    lastScanAt: null,
  },
  {
    id: "4600d119-0196-4bb0-a315-89f537a6b3f0",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    imageUri:
      "https://i.pinimg.com/1200x/91/6d/53/916d536e560e0c783e4134300ae0ac6f.jpg",
    originalFilename: null,
    contentType: null,
    sizeBytes: null,
    description: "Stella",
    lastScanAt: null,
  },
  {
    id: "10b72f1d-d01c-4f5f-be2b-f801412a769f",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    imageUri:
      "https://i.pinimg.com/1200x/b1/bb/3c/b1bb3cb3cfaa6dc68a52bc28c46595d1.jpg",
    originalFilename: null,
    contentType: null,
    sizeBytes: null,
    description: "Layla",
    lastScanAt: null,
  },
];

export const initialUsers = [
  {
    id: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    email: "gia_seeds@gmail.com",
    password: "H4shed_password_",
    firstName: "Gia",
    lastName: "Seeds",
    avatar: null,
    subscriptionTier: SubscriptionTier.FREE,
  },
  {
    id: "49cb44a3-e6f9-4cd0-a7f8-292d5b3e5231",
    email: "amanda_rowles@gmail.com",
    password: "H4shed_password_#",
    firstName: "Amanda",
    lastName: "Rowles",
    avatar: null,
    subscriptionTier: SubscriptionTier.FREE,
  },
];

export const addUsers = async (prisma: PrismaClient): Promise<void> => {
  await prisma.user.createMany({
    data: initialUsers,
    skipDuplicates: true,
  });

  await prisma.artwork.createMany({
    data: initialArtworks,
    skipDuplicates: true,
  });
};
