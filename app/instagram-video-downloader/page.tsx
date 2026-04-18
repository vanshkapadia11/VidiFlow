import React from "react";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import InstagramDownloaderComingSoon from "./InstaVideoDownloader";
import InstagramWaitlist from "./InstagramWaitlist";
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
  alternates: {
    canonical: "https://www.vidiflow.co/instagram-video-downloader",
  },
  openGraph: {
    title: "Instagram Video & Reels Downloader — Free",
    description:
      "Download Instagram Reels, videos and Stories for free. No watermark, works on all devices.",
    url: "https://www.vidiflow.co/instagram-downloader",
  },
  twitter: {
    title: "Instagram Video Downloader — Free",
    description: "Save Instagram Reels and videos free. Works on all devices.",
  },
};

const isEnabled = process.env.NEXT_PUBLIC_INSTAGRAM_ENABLED === "true";

const InstaVideoDownloaderPage = () => {
  return (
    <>
      <main>
        {isEnabled ? <InstagramDownloaderComingSoon /> : <InstagramWaitlist />}
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
