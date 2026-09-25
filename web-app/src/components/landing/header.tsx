import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../toggle-theme";
import { LanguageToggle } from "../ui/languageToggle";
import type { LandingStrings } from "../../app/landing/locale";

export function LandingHeader({ strings }: { strings: LandingStrings }) {
  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label={`VigilArt — ${strings.nav.beta}`}
        >
          <span className="shrink-0 sm:hidden">
            <Image
              src="/VigilArt_logo_black.png"
              alt=""
              width={300}
              height={300}
              className="size-6 dark:hidden"
              priority
            />
            <Image
              src="/VigilArt_logo_white.png"
              alt=""
              width={300}
              height={300}
              className="hidden size-6 dark:block"
              priority
            />
          </span>
          <span className="hidden shrink-0 sm:block">
            <Image
              src="/VigilArt_wordmark_black.png"
              alt=""
              width={600}
              height={164}
              className="h-auto w-[7.5rem] translate-y-0.5 dark:hidden"
              priority
            />
            <Image
              src="/VigilArt_wordmark_white.png"
              alt=""
              width={600}
              height={164}
              className="hidden h-auto w-[7.5rem] translate-y-0.5 dark:block"
              priority
            />
          </span>
          <span
            aria-hidden="true"
            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {strings.nav.beta}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
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
