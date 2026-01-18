import { dateTimeStringToDate } from "../../constants";
import { ArtworkSchema as base } from "../../generated/zod";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const LIMIT_DELETION = 10;

export const ArtworkSchema = base.extend({
  userId: z.uuid(),
  createdAt: dateTimeStringToDate,
  updatedAt: dateTimeStringToDate,
  lastScanAt: dateTimeStringToDate,
});
export class ArtworkDTO extends createZodDto(ArtworkSchema) {}

export const ArtworkCreateSchema = ArtworkSchema.pick({
  userId: true,
  originalFilename: true,
  contentType: true,
  sizeBytes: true,
  description: true,
  width: true,
  height: true,
  storageKey: true,
  lastScanAt: true,
})
  .partial({
    lastScanAt: true,
    description: true,
  })
  .extend({
    userId: z.uuid({
      error: (e) =>
        e.input === undefined ? "User id is required." : undefined,
    }),
    originalFilename: z.string({
      error: (e) =>
        e.input === undefined ? "Original filename is required." : undefined,
    }),
    contentType: z.string({
      error: (e) =>
        e.input === undefined ? "Content type is required." : undefined,
    }),
    sizeBytes: z.int({
      error: (e) =>
        e.input === undefined ? "Size bytes is required." : undefined,
    }),
    storageKey: z.string({
      error: (e) =>
        e.input === undefined ? "Storage key is required." : undefined,
    }),
    width: z.int({
      error: (e) => (e.input === undefined ? "Width is required." : undefined),
    }),
    height: z.int({
      error: (e) => (e.input === undefined ? "Height is required." : undefined),
    }),
  });

export class ArtworkCreateDTO extends createZodDto(ArtworkCreateSchema) {}

export const ArtworkCreateManySchema = z.array(ArtworkCreateSchema);

export class ArtworkCreateManyDTO extends createZodDto(
  ArtworkCreateManySchema,
) {}

export const ArtworkUpdateSchema = ArtworkSchema.pick({
  description: true,
}).partial({
  description: true,
});

export class ArtworkUpdateDTO extends createZodDto(ArtworkUpdateSchema) {}

export const ArtworkRemoveManySchema = z.object({
  ids: z
    .array(z.uuid())
    .max(LIMIT_DELETION, `Can only select up to ${LIMIT_DELETION}`),
});

export class ArtworkRemoveManyDTO extends createZodDto(
  ArtworkRemoveManySchema,
) {}

export const ArtworkCreateManyResponseSchema = z.object({
  count: z.number(),
  artworks: z.array(
    ArtworkSchema.pick({
      id: true,
      userId: true,
      originalFilename: true,
    }),
  ),
});

export class ArtworkCreateManyResponseDTO extends createZodDto(
  ArtworkCreateManyResponseSchema,
) {}
