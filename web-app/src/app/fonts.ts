import { Geist, Geist_Mono } from "next/font/google";

// `globals.css` has always named these two variables and nothing ever defined
// them, so `font-family` resolved to nothing and every visitor saw their own
// operating system's default sans. next/font self-hosts the files at build
// time, so there is no request to Google at runtime and no reflow when they
// arrive.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
});
