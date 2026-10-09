import type { Metadata } from "next";
import { LandingHeader } from "../components/landing/header";
import { LandingHero } from "../components/landing/hero";
import { LandingFooter } from "../components/landing/footer";
import en from "../../public/locales/en/translation.json";
import fr from "../../public/locales/fr/translation.json";
import { cookies } from "next/headers";
import { normalizeLanguage } from "./i18n/language";
import { selectLocalizedMetadata } from "./i18n/metadata";

export const generateMetadata = async (): Promise<Metadata> => {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("language")?.value);

  return selectLocalizedMetadata(language, {
    en: { title: "VigilArt", description: en.landing_page.hero.subhead },
    fr: { title: "VigilArt", description: fr.landing_page.hero.subhead },
  });
};

export default function Home() {
  // bg-card is exactly what login and sign-up paint: #ffffff light, #171717
  // dark. Matching by token rather than by a hardcoded colour.
  return (
    <div className="flex min-h-[100dvh] flex-col bg-card">
      <LandingHeader />
      {/* The hero is the whole page, so it centres in what is left between
          header and footer rather than sitting against the header. */}
      <main className="flex flex-1 items-center">
        <LandingHero />
      </main>
      <LandingFooter />
    </div>
  );
}
