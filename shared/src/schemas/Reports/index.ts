import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const GetArtworksMatchesSchema = z.object({
  websiteCategory: z.string().optional(),
});
export class GetArtworksMatchesDTO extends createZodDto(GetArtworksMatchesSchema) {}
