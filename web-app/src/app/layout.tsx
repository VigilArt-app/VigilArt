import "./globals.css";
import { cookies } from "next/headers";
import { LayoutClient } from "./layout-client";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const hasAuthToken = (await cookieStore).has("auth_token");
  const hasRefreshToken = (await cookieStore).has("refresh_token");

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LayoutClient hasAuthToken={hasAuthToken} hasRefreshToken={hasRefreshToken}>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
