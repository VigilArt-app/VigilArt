import Link from "next/link";
import type { LandingStrings } from "../../app/landing/locale";

export const LandingFooter = ({
  strings,
}: {
  strings: LandingStrings;
}): React.JSX.Element => {
  return (
    <footer>
      <div className="flex w-full justify-center px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label={`${strings.footer.privacy}, ${strings.footer.terms}, ${strings.footer.faq}`}
          className="flex items-center gap-6 text-sm text-muted-foreground"
        >
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            {strings.footer.privacy}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            {strings.footer.terms}
          </Link>
          <Link href="/faq" className="transition-colors hover:text-foreground">
            {strings.footer.faq}
          </Link>
        </nav>
      </div>
    </footer>
  );
};
