"use client";

import { useTranslation } from "react-i18next";
import { ScanPanel } from "./scan/scan-panel";

export const LandingHero = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 lg:py-16">
      {/* Deliberately not a card: the headline is the page speaking, not a
          block of data. Only the scan panel is a surface. */}
      <div className="min-w-0 max-w-xl">
        <h1 className="landing-reveal-headline text-balance text-4xl leading-[1.05] font-medium tracking-[-0.03em] sm:text-5xl">
          {t("landing_page.hero.headline_line_1")}
          <br />
          <span className="text-primary">
            {t("landing_page.hero.headline_line_2")}
          </span>
        </h1>
        <p className="landing-reveal-subhead mt-6 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
          {t("landing_page.hero.subhead")}
        </p>
        <p className="landing-reveal-trust mt-4 max-w-[52ch] text-pretty font-semibold leading-relaxed">
          {t("landing_page.hero.artwork_use")}
        </p>
      </div>

      <div className="landing-reveal-scan min-w-0">
        <ScanPanel />
      </div>
    </section>
  );
};
