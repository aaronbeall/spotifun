import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnalyticsClicks } from "@/components/AnalyticsClicks";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spotifun - Your Spotify Analytics Dashboard",
  description: "Discover insights, stats, and fun feedback about your Spotify listening habits. Get your personalized music profile and achievements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} flex min-h-screen flex-col bg-gray-950 antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-5ZH965VP"
          strategy="beforeInteractive"
        />
        <Script id="gtag-init" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`}
        </Script>
        <AnalyticsClicks />
        <Tooltip.Provider>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Tooltip.Provider>
      </body>
    </html>
  );
}
