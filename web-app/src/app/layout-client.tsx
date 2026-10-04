"use client";

import { lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "sonner";
import { PUBLIC_SHELL_ROUTES } from "../lib/route-access";
import type { AppLanguage } from "./i18n/language";
// A dynamic provider changes the React tree path during hydration, giving
// descendant Radix controls different server/client IDs.
import I18nProvider from "./i18n/I18nProvider";

// Split out of the shared bundle rather than imported directly: the shell pulls
// in Firebase and i18next (85 kB gzipped between them), and the landing page is
// the one route anonymous visitors reach. Server rendering is left on, so the
// signed-in app still arrives as HTML.
// next/dynamic adds a server-only preload child that shifts Radix useId paths.
// React.lazy keeps the server/client tree identical while retaining the split.
const AppShell = lazy(() =>
  import("./app-shell").then((module) => ({ default: module.AppShell }))
);

type LayoutClientProps = Readonly<{
  children: React.ReactNode;
  language: AppLanguage;
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
}>;

export const LayoutClient = ({
  children,
  language,
  hasAuthToken,
  hasRefreshToken,
}: LayoutClientProps): React.JSX.Element => {
  const pathname = usePathname();
  // Public-shell pages carry their own header and footer. They skip the auth
  // context, which calls /auth/me and redirects anonymous visitors to /login.
  const isPublicShell = PUBLIC_SHELL_ROUTES.includes(pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster position="top-right" richColors />
      <I18nProvider language={language} fallback={isPublicShell ? null : undefined}>
        {isPublicShell ? (
          children
        ) : (
          <Suspense fallback={null}>
            <AppShell hasAuthToken={hasAuthToken} hasRefreshToken={hasRefreshToken}>
              {children}
            </AppShell>
          </Suspense>
        )}
      </I18nProvider>
    </ThemeProvider>
  );
};
