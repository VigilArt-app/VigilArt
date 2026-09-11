"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import i18next from "i18next";
import { setCookie } from "../../app/cookies";
import type { LandingLocale } from "../../app/landing/locale";

// The landing page's headline, nav and footer are rendered on the server from
// the `language` cookie, so switching language in the client-side toggle only
// repaints the client components. This asks the server for the page again.
export function LandingLocaleSync({ locale }: { locale: LandingLocale }) {
  const router = useRouter();

  useEffect(() => {
    const onChange = (next: string) => {
      // I18nProvider replays the saved language on mount, which fires this
      // event with the value the server already used. Refreshing on that would
      // cost a round trip on every page load.
      if (next === locale) return;
      setCookie("language", next);
      router.refresh();
    };

    i18next.on("languageChanged", onChange);
    return () => {
      i18next.off("languageChanged", onChange);
    };
  }, [locale, router]);

  return null;
}
