import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIER — AI Equity Researcher",
  description:
    "AIER (AI Equity Researcher): analyze stocks, compare peers, and get fundamentals and technicals with a sleek chat interface.",
  icons: {
    // Use multiple aliases to improve compatibility and bust cache with a query string
    icon: [
      { url: "/airplane.png?v=2", sizes: "any" },
      { url: "/favicon.ico?v=2" },
      { url: "/icon.png?v=2" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2" }],
    shortcut: [{ url: "/favicon.ico?v=2" }],
  },
  applicationName: "AIER",
  keywords: [
    "AIER",
    "AI Equity Researcher",
    "stocks",
    "fundamental analysis",
    "technical analysis",
    "peer comparison",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
