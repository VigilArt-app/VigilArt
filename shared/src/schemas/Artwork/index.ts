import {
  ARTWORKS_CREATE_BATCH_MAX_SIZE,
  dateTimeStringToDate,
  ARTWORKS_DELETE_BATCH_MAX_SIZE
} from "../../constants";
import { ArtworkSchema as base } from "../../generated/zod";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const ArtworkSchema = base.extend({
  userId: z.uuid(),
  createdAt: dateTimeStringToDate,
  updatedAt: dateTimeStringToDate,
  description: z.optional(z.string()),
  lastScanAt: z.optional(dateTimeStringToDate)
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
  lastScanAt: true
}).extend({
  userId: z.uuid({
    error: (e) => (e.input === undefined ? "User id is required." : undefined)
  }),
  originalFilename: z.string({
    error: (e) =>
      e.input === undefined ? "Original filename is required." : undefined
  }),
  contentType: z.string({
    error: (e) =>
      e.input === undefined ? "Content type is required." : undefined
  }),
  sizeBytes: z.int({
    error: (e) =>
      e.input === undefined ? "Size bytes is required." : undefined
  }),
  storageKey: z.string({
    error: (e) =>
      e.input === undefined ? "Storage key is required." : undefined
  }),
  width: z.int({
    error: (e) => (e.input === undefined ? "Width is required." : undefined)
  }),
  height: z.int({
    error: (e) => (e.input === undefined ? "Height is required." : undefined)
  })
});

export class ArtworkCreateDTO extends createZodDto(ArtworkCreateSchema) {}

export const ArtworkCreateManySchema = z
  .array(ArtworkCreateSchema)
  .max(
    ARTWORKS_CREATE_BATCH_MAX_SIZE,
    `Can only select up to ${ARTWORKS_CREATE_BATCH_MAX_SIZE}`
  );

export class ArtworkCreateManyDTO extends createZodDto(
  ArtworkCreateManySchema
) {}

export const ArtworkUpdateSchema = ArtworkSchema.pick({
  description: true
}).partial({
  description: true
});

export class ArtworkUpdateDTO extends createZodDto(ArtworkUpdateSchema) {}

export const ArtworkRemoveManySchema = z.object({
  ids: z
    .array(z.uuid())
    .max(
      ARTWORKS_DELETE_BATCH_MAX_SIZE,
      `Can only select up to ${ARTWORKS_DELETE_BATCH_MAX_SIZE}`
    )
});

export class ArtworkRemoveManyDTO extends createZodDto(
  ArtworkRemoveManySchema
) {}

export const ArtworkCreateManyResponseSchema = z.object({
  count: z.number(),
  artworks: z.array(
    ArtworkSchema.pick({
      id: true,
      userId: true,
      originalFilename: true
    })
  )
});

export class ArtworkCreateManyResponseDTO extends createZodDto(
  ArtworkCreateManyResponseSchema
) {}
