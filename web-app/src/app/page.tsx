import type { Metadata } from "next";
import { LandingHeader } from "../components/landing/header";
import { LandingHero } from "../components/landing/hero";
import { LandingFooter } from "../components/landing/footer";
import { LandingLocaleSync } from "../components/landing/locale-sync";
import { getLandingLocale, getLandingStrings } from "./landing/locale";

export async function generateMetadata(): Promise<Metadata> {
  const strings = getLandingStrings(await getLandingLocale());
  return {
    title: "VigilArt",
    description: strings.hero.subhead
  };
}

export default async function Home() {
  const locale = await getLandingLocale();
  const strings = getLandingStrings(locale);

  // bg-card is exactly what login and sign-up paint: #ffffff light, #171717
  // dark. Matching by token rather than by a hardcoded colour.
  return (
    <div className="flex min-h-[100dvh] flex-col bg-card">
      <LandingLocaleSync locale={locale} />
      <LandingHeader strings={strings} />
      {/* The hero is the whole page, so it centres in what is left between
          header and footer rather than sitting against the header. */}
      <main className="flex flex-1 items-center">
        <LandingHero strings={strings} />
      </main>
      <LandingFooter strings={strings} />
    </div>
  );
}
