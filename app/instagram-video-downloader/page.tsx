import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
// import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
import InstagramDownloaderComingSoon from "./InstaVideoDownloader";
import { instagramContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Instagram Video & Reels Downloader — Save Instagram Videos Free",
  description:
    "Download Instagram videos, Reels, Stories and IGTV for free. Paste any Instagram link and save instantly in HD quality. Works on iPhone, Android and PC. No app needed.",
  keywords: [
    "instagram downloader",
    "instagram video downloader",
    "download instagram reels",
    "save instagram video",
    "instagram reels downloader",
    "instagram story downloader",
    "download instagram videos free",
    "instagram to mp4",
  ],
  openGraph: {
    title: "Instagram Video & Reels Downloader — Free",
    description:
      "Download Instagram Reels, videos and Stories for free. No watermark, works on all devices.",
    url: "https://vidiflow.co/instagram-downloader",
  },
  twitter: {
    title: "Instagram Video Downloader — Free",
    description: "Save Instagram Reels and videos free. Works on all devices.",
  },
};

const InstaVideoDownloaderPage = () => {
  return (
    <>
      <main>
        <InstagramDownloaderComingSoon />
      </main>
      <PageContent
        description={instagramContent.description}
        steps={instagramContent.steps}
        features={instagramContent.features}
        faqs={instagramContent.faqs}
      />
    </>
  );
};

export default InstaVideoDownloaderPage;
