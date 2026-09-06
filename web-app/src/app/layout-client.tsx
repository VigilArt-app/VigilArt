"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/toggle-theme";
import { DownloadApkButton } from "../components/download-apk-button";
import { LanguageToggle } from "../components/ui/languageToggle";
import I18nProvider from "./i18n/I18nProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "../components/contexts/authContext";
import { SessionRefreshGate } from "../components/auth/session-refresh-gate";
import { NotificationsProvider } from "../components/contexts/notificationsContext";

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
  const noSidebarRoutes = ["/login", "/sign-up"];
  const showSidebar = !noSidebarRoutes.includes(pathname || "");
  const shouldRefreshSession = showSidebar && !hasAuthToken && hasRefreshToken;
  const sidebarShell = (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen overflow-x-hidden">
        <SidebarTrigger className="fixed top-4 left-4 z-50" />
        <div className="fixed top-4 right-4 flex items-center justify-evenly space-x-4 z-50">
          <DownloadApkButton />
          <ThemeToggle />
          <LanguageToggle />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );

  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Toaster position="top-right" richColors />
        {showSidebar ? (
          shouldRefreshSession ? (
            <SessionRefreshGate enabled>
              <AuthProvider>
                <NotificationsProvider>
                  {sidebarShell}
                </NotificationsProvider>
              </AuthProvider>
            </SessionRefreshGate>
          ) : (
            <AuthProvider>
              <NotificationsProvider>
                {sidebarShell}
              </NotificationsProvider>
            </AuthProvider>
          )
        ) : (
          <main className="w-full min-h-screen overflow-x-hidden">
            <div className="fixed top-4 right-4 flex items-center justify-evenly space-x-4 z-50">
              <DownloadApkButton />
              <ThemeToggle />
              <LanguageToggle />
            </div>
            {children}
          </main>
        )}
      </ThemeProvider>
    </I18nProvider>
  );
}