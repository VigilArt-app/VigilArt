"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export const LandingFooter = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <footer>
      <div className="flex w-full justify-center px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label={`${t("landing_page.footer.privacy")}, ${t("landing_page.footer.terms")}, ${t("landing_page.footer.faq")}`}
          className="flex items-center gap-6 text-sm text-muted-foreground"
        >
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            {t("landing_page.footer.privacy")}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            {t("landing_page.footer.terms")}
          </Link>
          <Link href="/faq" className="transition-colors hover:text-foreground">
            {t("landing_page.footer.faq")}
          </Link>
        </nav>
      </div>
    </footer>
  );
};
