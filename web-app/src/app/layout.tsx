import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { geistSans, geistMono } from "./fonts";
import { LayoutClient } from "./layout-client";
import { getLandingLocale } from "./landing/locale";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icon.png" },
      // A black mark disappears against a dark browser tab, so hand the white
      // one to browsers that report a dark theme.
      {
        url: "/VigilArt_logo_white.png",
        media: "(prefers-color-scheme: dark)"
      }
    ],
    apple: "/apple-icon.png"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The document language has to be right before React hydrates: a hardcoded
  // "en" tells screen readers and search engines the wrong thing on the French
  // landing page.
  const lang = await getLandingLocale();
  const cookieStore = await cookies();
  const hasAuthToken = cookieStore.has("auth_token");
  const hasRefreshToken = cookieStore.has("refresh_token");

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <LayoutClient hasAuthToken={hasAuthToken} hasRefreshToken={hasRefreshToken}>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
