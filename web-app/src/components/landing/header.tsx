import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../toggle-theme";
import { LanguageToggle } from "../ui/languageToggle";
import type { LandingStrings } from "../../app/landing/locale";

export function LandingHeader({ strings }: { strings: LandingStrings }) {
  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 self-start sm:self-auto"
          aria-label={`VigilArt — ${strings.nav.beta}`}
        >
          <Image
            src="/VigilArt_wordmark_black.png"
            alt=""
            width={600}
            height={164}
            className="h-auto w-[7.5rem] dark:hidden"
            priority
          />
          <Image
            src="/VigilArt_wordmark_white.png"
            alt=""
            width={600}
            height={164}
            className="hidden h-auto w-[7.5rem] dark:block"
            priority
          />
          <span
            aria-hidden="true"
            className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {strings.nav.beta}
          </span>
        </Link>

        <nav className="flex items-center gap-1 self-end sm:self-auto sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {/* French authentication labels exceed the available header width
              below 480px, so login yields that space to the primary action. */}
          <Button asChild variant="ghost" size="sm" className="max-[479px]:hidden">
            <Link href="/login">{strings.nav.log_in}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">{strings.nav.sign_up}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
