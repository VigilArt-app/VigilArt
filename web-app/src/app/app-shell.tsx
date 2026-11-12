"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { ThemeToggle } from "../components/toggle-theme";
import { LanguageToggle } from "../components/ui/languageToggle";
import { AuthProvider } from "../components/contexts/authContext";
import { SessionRefreshGate } from "../components/auth/session-refresh-gate";
import { NotificationsProvider } from "../components/contexts/notificationsContext";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
}>;

// The signed-in application shell, unchanged. It lives in its own file so
// layout-client.tsx can load it lazily: these providers pull in Firebase and
// i18next, and an anonymous visitor on the landing page has no use for either.
export function AppShell({
  children,
  hasAuthToken,
  hasRefreshToken,
}: AppShellProps) {
  const pathname = usePathname();
  const noSidebarRoutes = ["/login", "/sign-up"];
  const showSidebar = !noSidebarRoutes.includes(pathname || "");
  const shouldRefreshSession = showSidebar && !hasAuthToken && hasRefreshToken;
  const sidebarShell = (
    // The toggle only exists on mobile, so the desktop sidebar is pinned open:
    // otherwise a stored collapsed state (or Ctrl+B) would leave no way back.
    <SidebarProvider open>
      <AppSidebar />
      {/* pt-14 keeps page content below the phone menu bar. */}
      <main className="w-full min-h-screen overflow-x-hidden pt-14 md:pt-0">
        <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b bg-background px-2 md:hidden">
          <SidebarTrigger className="size-11" />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );

  return showSidebar ? (
    shouldRefreshSession ? (
      <SessionRefreshGate enabled>
        <AuthProvider>
          <NotificationsProvider>{sidebarShell}</NotificationsProvider>
        </AuthProvider>
      </SessionRefreshGate>
    ) : (
      <AuthProvider>
        <NotificationsProvider>{sidebarShell}</NotificationsProvider>
      </AuthProvider>
    )
  ) : (
    <main className="w-full min-h-screen overflow-x-hidden">
      <div className="fixed top-4 right-4 flex items-center justify-evenly space-x-4 z-50">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      {children}
    </main>
  );
}
