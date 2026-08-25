"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "sonner";

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

export function LayoutClient({
  children,
  hasAuthToken,
  hasRefreshToken,
}: LayoutClientProps) {
  const pathname = usePathname();
  // The landing page carries its own header, and its copy is rendered on the
  // server so search engines see it. It skips the sidebar, the auth context
  // (which calls /auth/me and bounces anonymous visitors to /login) and the
  // floating toggles, which would sit on top of its own header.
  const isLanding = pathname === "/";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster position="top-right" richColors />
      {isLanding ? (
        // The landing needs i18next for the shared dropzone, the category
        // legend and the language toggle, but not the dashboard-shaped
        // placeholder its provider paints by default.
        <I18nProvider fallback={null}>{children}</I18nProvider>
      ) : (
        <AppShell hasAuthToken={hasAuthToken} hasRefreshToken={hasRefreshToken}>
          {children}
        </AppShell>
      )}
    </ThemeProvider>
  );
}
