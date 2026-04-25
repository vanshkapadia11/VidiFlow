import React from "react";
import PinterestDownloader from "./Downloader";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import { pinterestContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Pinterest Video Downloader — Download Pinterest Videos & GIFs Free",
  description:
    "Download Pinterest videos, GIFs and clips for free. Paste any Pinterest pin link and save instantly in HD quality. Works on iPhone, Android and PC. No app needed.",
  keywords: [
    "pinterest video downloader",
    "download pinterest videos",
    "pinterest downloader",
    "save pinterest video",
    "pinterest gif downloader",
    "pinterest to mp4",
    "download pinterest free",
    "pinterest video save",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/pinterest-video-downloader",
  },
  openGraph: {
    title: "Pinterest Video Downloader — Free",
    description:
      "Download Pinterest videos and GIFs for free. HD quality, works on all devices.",
    url: "https://www.vidiflow.co/pinterest-video-downloader",
  },
  twitter: {
    title: "Pinterest Video Downloader Free",
    description: "Save Pinterest videos and GIFs free. Works on all devices.",
  },
};

const PinterestDownloaderPage = () => {
  return (
    <>
      <main>
        <PinterestDownloader />
      </main>
      <PageContent
        description={pinterestContent.description}
        steps={pinterestContent.steps}
        features={pinterestContent.features}
        faqs={pinterestContent.faqs}
      />
    </>
  );
};

export default PinterestDownloaderPage;
