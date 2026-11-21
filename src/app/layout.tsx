import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnalyticsClicks } from "@/components/AnalyticsClicks";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsentNotice } from "@/components/ConsentNotice";
import { CONSENT_DEFAULTS_SCRIPT } from "@/lib/consent";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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

const DESCRIPTION =
  "Get nerdy about your Spotify listening. Spotifun turns what you play into vibes, genre maps, stream charts, a listener persona and a few silly badges you can send to friends.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spotifun - get nerdy about your listening",
    template: "%s · Spotifun",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["Spotify stats", "music taste", "listening persona", "top artists", "genre map", "music vibes"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: "Spotifun - get nerdy about your listening",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotifun - get nerdy about your listening",
    description: DESCRIPTION,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "MusicApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a Spotify account",
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
        {/* Consent defaults have to be in the dataLayer before the Google tag reads it. */}
        <Script id="gtag-consent" strategy="beforeInteractive">
          {CONSENT_DEFAULTS_SCRIPT}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-5ZH965VP"
          strategy="beforeInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
        />
        <AnalyticsClicks />
        <Tooltip.Provider>
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <ConsentNotice />
        </Tooltip.Provider>
      </body>
    </html>
  );
}
