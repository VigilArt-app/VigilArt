"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "sonner";
import { PUBLIC_SHELL_ROUTES } from "./public-routes";

// Split out of the shared bundle rather than imported directly: the shell pulls
// in Firebase and i18next (85 kB gzipped between them), and the landing page is
// the one route anonymous visitors reach. Server rendering is left on, so the
// signed-in app still arrives as HTML.
const AppShell = dynamic(() =>
  import("./app-shell").then((module) => module.AppShell)
);

// Dynamic for the same reason: AppShell already pulls i18next in behind its own
// split, so importing it statically here would put it back in every route's
// shared bundle, including routes that never translate anything.
const I18nProvider = dynamic(() => import("./i18n/I18nProvider"));

type LayoutClientProps = Readonly<{
  children: React.ReactNode;
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
}>;

export const LayoutClient = ({
  children,
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
      {isPublicShell ? (
        // Public pages need i18next for their language toggle, but not the
        // dashboard-shaped placeholder the provider paints by default.
        <I18nProvider fallback={null}>{children}</I18nProvider>
      ) : (
        <AppShell hasAuthToken={hasAuthToken} hasRefreshToken={hasRefreshToken}>
          {children}
        </AppShell>
      )}
    </ThemeProvider>
  );
};
