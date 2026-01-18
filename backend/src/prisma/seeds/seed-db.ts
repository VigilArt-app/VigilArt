import { Artwork, SubscriptionTier } from "@vigilart/shared";
import { PrismaClient } from "@vigilart/shared/server";

export const initialArtworks = [
  {
    id: "c0c2bf8e-fdae-4da6-a8ce-eff2059676cb",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    storageKey:
      "artworks/2a5685a1-f4d0-428d-9c12-88a136777bdf/grey_haired_woman2a5685a1-f4d0-428d-9c12-88a136777bdf.jpg",
    originalFilename: "grey_haired_woman.jpg",
    contentType: "image/jpeg",
    sizeBytes: 81686,
    width: 900,
    height: 800,
    description: "Grey-haired woman holding a flower",
  },
  {
    id: "7570d89a-2dc4-440f-bdbb-c1747f4e779d",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    storageKey:
      "artworks/2a5685a1-f4d0-428d-9c12-88a136777bdf/woman_smiling_flower3fdc9208-3634-4804-8df7-d19cd426ca30.jpg",
    originalFilename: "woman_smiling_flower.jpg",
    contentType: "image/jpeg",
    sizeBytes: 171878,
    width: 900,
    height: 800,
    description: "Woman smiling, holding a flower",
  },
  {
    id: "4600d119-0196-4bb0-a315-89f537a6b3f0",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    storageKey:
      "artworks/2a5685a1-f4d0-428d-9c12-88a136777bdf/woman_flower_bouquete8ea902a-e81b-47c2-8d5a-9317286d609b.jpg",
    originalFilename: "woman_flower_bouquet.jpg",
    contentType: "image/jpeg",
    sizeBytes: 81686,
    width: 900,
    height: 800,
    description: "Woman holding a flower bouquet",
  },
  {
    id: "10b72f1d-d01c-4f5f-be2b-f801412a769f",
    userId: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    storageKey:
      "artworks/2a5685a1-f4d0-428d-9c12-88a136777bdf/woman_flower50b479e5-2789-4cf1-98cd-9ca4a5b92c4b.jpg",
    originalFilename: "woman_flower.jpg",
    contentType: "image/jpeg",
    sizeBytes: 39189,
    width: 900,
    height: 800,
    description: "Woman holding a flower with a green background",
  },
];

export const initialUsers = [
  {
    id: "2a5685a1-f4d0-428d-9c12-88a136777bdf",
    email: "ayaka_suda@gmail.com",
    password: "H4shed_password_",
    firstName: "Ayaka",
    lastName: "Suda",
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

export const seedDb = async (prisma: PrismaClient): Promise<void> => {
  await prisma.user.createMany({
    data: initialUsers,
    skipDuplicates: true,
  });

  await prisma.artwork.createMany({
    data: initialArtworks,
    skipDuplicates: true,
  });
};
