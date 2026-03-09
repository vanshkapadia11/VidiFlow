import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
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

export const rootMetadata = {
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
  openGraph: {
    title: "VidiFlow — Free Video Downloader",
    description:
      "Download videos from TikTok, YouTube, Instagram, Facebook and more. Free, fast, no watermark.",
    url: "https://vidiflow.co",
    siteName: "VidiFlow",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VidiFlow — Free Video Downloader",
    description:
      "Download videos from TikTok, YouTube, Instagram, Facebook and more. Free, fast, no watermark.",
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
      </body>
    </html>
  );
}
