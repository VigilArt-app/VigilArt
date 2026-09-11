import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../toggle-theme";
import { LanguageToggle } from "../ui/languageToggle";
import type { LandingStrings } from "../../app/landing/locale";

export function LandingHeader({ strings }: { strings: LandingStrings }) {
  return (
    // A rounded block inset from the page, the same radius every Card uses, so
    // the header belongs to the same system as the rest of the app.
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-xl border bg-background px-4 shadow-sm sm:px-6">
        <Link href="/" className="flex items-center" aria-label="VigilArt">
          <Image
            src="/VigilArt_logo_black.png"
            alt="VigilArt"
            width={300}
            height={300}
            className="h-9 w-9 dark:hidden"
            priority
          />
          <Image
            src="/VigilArt_logo_white.png"
            alt="VigilArt"
            width={300}
            height={300}
            className="hidden h-9 w-9 dark:block"
            priority
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {/* French authentication labels collapse the logo below 480px, so
              the secondary action yields that space to the brand and sign-up. */}
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
