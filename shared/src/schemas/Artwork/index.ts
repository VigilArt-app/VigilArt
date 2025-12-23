import { dateTimeStringToDate } from "../../constants";
import { ArtworkSchema as base } from "../../generated/zod";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const ArtworkSchema = base.extend({
  createdAt: dateTimeStringToDate,
  updatedAt: dateTimeStringToDate,
  lastScanAt: dateTimeStringToDate,
});
export class ArtworkDTO extends createZodDto(ArtworkSchema) {}

export const ArtworkCreateSchema = ArtworkSchema.pick({
  userId: true,
  imageUri: true,
  originalFilename: true,
  contentType: true,
  sizeBytes: true,
  description: true,
})
  .partial({
    originalFilename: true,
    contentType: true,
    sizeBytes: true,
    description: true,
  })
  .extend({
    userId: z.string({
      error: (e) =>
        e.input === undefined ? "User id is required." : undefined,
    }),
    imageUri: z.string({
      error: (e) => (e.input === undefined ? "Image URI is required." : undefined),
    }),
  });

export class ArtworkCreateDTO extends createZodDto(ArtworkCreateSchema) {}

export const ArtworkUpdateSchema = ArtworkSchema.pick({
  description: true,
});
export class ArtworkUpdateDTO extends createZodDto(ArtworkUpdateSchema) {}
