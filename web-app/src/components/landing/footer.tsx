import Image from "next/image";
import Link from "next/link";
import type { LandingStrings } from "../../app/landing/locale";

export const LandingFooter = ({
  strings,
}: {
  strings: LandingStrings;
}): React.JSX.Element => {
  return (
    <footer>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <Image
          src="/VigilArt_wordmark_black.png"
          alt={strings.footer.wordmark_alt}
          width={600}
          height={164}
          className="h-7 w-auto dark:hidden"
        />
        <Image
          src="/VigilArt_wordmark_white.png"
          alt={strings.footer.wordmark_alt}
          width={600}
          height={164}
          className="hidden h-7 w-auto dark:block"
        />
        <nav
          aria-label={`${strings.footer.privacy}, ${strings.footer.terms}`}
          className="flex items-center gap-6 text-sm text-muted-foreground"
        >
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            {strings.footer.privacy}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            {strings.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
};
