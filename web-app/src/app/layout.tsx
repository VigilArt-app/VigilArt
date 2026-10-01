import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { geistSans, geistMono } from "./fonts";
import { LayoutClient } from "./layout-client";
import { normalizeLanguage } from "./i18n/language";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icon.png", sizes: "48x48", type: "image/png" },
      {
        url: "/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = normalizeLanguage(cookieStore.get("language")?.value);
  const hasAuthToken = cookieStore.has("auth_token");
  const hasRefreshToken = cookieStore.has("refresh_token");

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <LayoutClient
          language={lang}
          hasAuthToken={hasAuthToken}
          hasRefreshToken={hasRefreshToken}
        >
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
