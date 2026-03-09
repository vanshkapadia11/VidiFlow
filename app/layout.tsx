import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import { Providers } from "./providers";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Change 'rootMetadata' to 'metadata' so Next.js can find it
export const metadata: Metadata = {
  metadataBase: new URL("https://vidiflow.co"),
  title: {
    default:
      "VidiFlow — Free Video Downloader for TikTok, YouTube, Instagram & More",
    template: "%s | VidiFlow",
  },
  description:
    "VidiFlow is a free online video downloader. Download videos from TikTok, YouTube, Instagram, Facebook, Pinterest, Snapchat, Twitter, LinkedIn and Twitch instantly. No app, no signup needed.",
  keywords: [
    "video downloader",
    "free video downloader",
    "online video downloader",
    "tiktok downloader",
    "youtube downloader",
    "instagram downloader",
    "facebook video downloader",
    "pinterest downloader",
    "snapchat downloader",
    "twitter video downloader",
    "linkedin video downloader",
    "twitch downloader",
  ],
  authors: [{ name: "VidiFlow" }],
  creator: "VidiFlow",

  // Add this part for your logo/favicon
  icons: {
    icon: "/icon.png", // Place your logo in the /public folder
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png", // Recommended for iPhone bookmarks
  },

  openGraph: {
    title: "VidiFlow — Free Video Downloader",
    description:
      "Download videos from TikTok, YouTube, Instagram, Facebook and more. Free, fast, no watermark.",
    url: "https://vidiflow.co",
    siteName: "VidiFlow",
    images: [
      {
        url: "/og-image.png", // The preview image when sharing on social media
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VidiFlow — Free Video Downloader",
    description:
      "Download videos from TikTok, YouTube, Instagram, Facebook and more. Free, fast, no watermark.",
    images: ["/og-image.png"],
    site: "@vidiflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
