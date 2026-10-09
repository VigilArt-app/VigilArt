import { z } from "zod";

const schema = z.object({
  apiUrl: z.url(),
  featureFlag: z.coerce.boolean().default(false),
  firebaseVapIdKey: z.string().optional(),
  turnstileSiteKey: z.string().trim().optional()
}).superRefine((value, context) => {
  if (process.env.NODE_ENV === "production" && !value.turnstileSiteKey) {
    context.addIssue({
      code: "custom",
      path: ["turnstileSiteKey"],
      message: "NEXT_PUBLIC_TURNSTILE_SITE_KEY is required in production."
    });
  }
});

export const config = schema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  featureFlag: process.env.NEXT_PUBLIC_FEATURE_FLAG,
  firebaseVapIdKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
  turnstileSiteKey:
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined
});

export const API_BASE_URL = config.apiUrl.replace(/\/+$/, "");
export const TURNSTILE_SITE_KEY = config.turnstileSiteKey || null;
