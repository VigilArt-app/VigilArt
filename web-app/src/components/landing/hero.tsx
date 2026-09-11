import { ScanPanel } from "./scan/scan-panel";
import type { LandingStrings } from "../../app/landing/locale";

export function LandingHero({ strings }: { strings: LandingStrings }) {
  return (
    <section className="mx-auto grid w-full min-w-0 max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
      {/* Deliberately not a card: the headline is the page speaking, not a
          block of data. Only the scan panel is a surface. */}
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-4xl font-medium tracking-tighter text-balance sm:text-5xl">
          {strings.hero.headline_line_1}
          <br />
          {strings.hero.headline_line_2}
        </h1>
        <p className="mt-6 max-w-[52ch] leading-relaxed text-muted-foreground">
          {strings.hero.subhead}
        </p>
        <p className="mt-6 max-w-[52ch] text-sm leading-relaxed">
          {strings.hero.how_it_works}
        </p>
      </div>

      <div className="min-w-0 lg:pt-2">
        <ScanPanel strings={strings} />
      </div>
    </section>
  );
}
