import { LandingFooter } from "../landing/footer";
import { LandingHeader } from "../landing/header";
import { LandingLocaleSync } from "../landing/locale-sync";
import {
  getLandingStrings,
  type LandingLocale,
} from "../../app/landing/locale";

type LegalPageShellProps = Readonly<{
  locale: LandingLocale;
  children: React.ReactNode;
}>;

export const LegalPageShell = ({
  locale,
  children,
}: LegalPageShellProps): React.JSX.Element => {
  const strings = getLandingStrings(locale);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-card">
      <LandingLocaleSync locale={locale} />
      <LandingHeader strings={strings} />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-12 text-foreground sm:px-6 sm:py-16 lg:py-20 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:sm:text-4xl [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_li]:pl-1 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:leading-7 [&_ul]:text-muted-foreground">
          {children}
        </article>
      </main>
      <LandingFooter strings={strings} />
    </div>
  );
};
