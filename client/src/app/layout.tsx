import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "CricZone 360 | Real-Time Cricket Platform",
  description: "Live scores, match schedules, player stats and historical cricket data.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script src="/config.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
