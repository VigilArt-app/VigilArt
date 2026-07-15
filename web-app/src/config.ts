import { z } from "zod";
import { initializeApp, getApps } from "firebase/app";

const schema = z.object({
  apiUrl: z.url(),
  featureFlag: z.coerce.boolean().default(false),
  firebaseVapIdKey: z.string().optional()
});

export const config = schema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  featureFlag: process.env.NEXT_PUBLIC_FEATURE_FLAG,
  firebaseVapIdKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
});

export const API_BASE_URL = config.apiUrl.replace(/\/+$/, "");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
