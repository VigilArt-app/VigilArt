import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/toggle-theme";
import { LanguageToggle } from "../components/ui/languageToggle";
import I18nProvider from './i18n/I18nProvider';

function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full min-h-screen">
            <SidebarTrigger />
            <div className="fixed top-4 right-4 flex justify-evenly space-x-4 z-50">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            {children}
          </main>
        </SidebarProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
