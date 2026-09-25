import { cookies } from "next/headers";
import en from "../../../public/locales/en/translation.json";
import fr from "../../../public/locales/fr/translation.json";

export const LANDING_LOCALES = ["en", "fr"] as const;
export type LandingLocale = (typeof LANDING_LOCALES)[number];

// The landing page is a Server Component so its text is in the HTML search
// engines receive. react-i18next runs in the browser and cannot do that, so the
// page reads the same `language` cookie the rest of the app writes and picks
// its strings here instead.
export async function getLandingLocale(): Promise<LandingLocale> {
  const value = (await cookies()).get("language")?.value;
  return LANDING_LOCALES.includes(value as LandingLocale)
    ? (value as LandingLocale)
    : "en";
}

export type LandingStrings = (typeof en)["landing_page"];

export function getLandingStrings(locale: LandingLocale): LandingStrings {
  return (locale === "fr" ? fr : en).landing_page;
}
