import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AdScript from "@/components/AdScript";
// import { Providers } from "./providers";

// Keep only what you actually use
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // ← add this! fixes LCP font delay
  preload: true, // ← add this!
});

// Delete geistSans and geistMono entirely

// Change 'rootMetadata' to 'metadata' so Next.js can find it
export const metadata: Metadata = {
  metadataBase: new URL("https://www.vidiflow.co"),
  title: {
    default:
      "VidiFlow — Free Video Downloader for TikTok, YouTube, Instagram & More",
    template: "%s | VidiFlow",
  },
  // altTitle: "VidiFlow — Free Video Downloader for TikTok, YouTube, Instagram & More",
  alternates: {
    canonical: "https://www.vidiflow.co",
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
      <head>
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9027923218074479"
          crossOrigin="anonymous"
        ></script> */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e60023" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VidiFlow" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `,
          }}
        />
      </head>
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
          <AdScript /> {/* ← loads ads 3s after page load */}
      </body>
    </html>
  );
}
