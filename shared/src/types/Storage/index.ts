import { z } from "zod";
import { PresignedUrlsSchema } from "../../schemas/Storage";

export type PresignedUrls = z.infer<typeof PresignedUrlsSchema>;

