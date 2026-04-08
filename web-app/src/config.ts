import { z } from "zod";

const schema = z.object({
  apiUrl: z.string().url(),
  featureFlag: z.coerce.boolean().default(false),
});

export const config = schema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  featureFlag: process.env.NEXT_PUBLIC_FEATURE_FLAG,
});

export const API_BASE_URL = config.apiUrl.replace(/\/+$/, "");
