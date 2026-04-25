import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import SnapchatDownloader from "./SnapchatVideoDonwloader";
import { snapchatContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title:
    "Snapchat Video Downloader — Download Snapchat Spotlight & Stories Free",
  description:
    "Download Snapchat Spotlight videos and public Stories for free. Paste any Snapchat link and save instantly. Works on iPhone, Android and PC. No app or login needed.",
  keywords: [
    "snapchat downloader",
    "snapchat video downloader",
    "download snapchat videos",
    "snapchat spotlight downloader",
    "save snapchat video",
    "snapchat story downloader",
    "snapchat to mp4",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/snapchat-video-downloader",
  },
  openGraph: {
    title: "Snapchat Video Downloader — Free",
    description:
      "Download Snapchat Spotlight and Stories for free. Works on all devices.",
    url: "https://www.vidiflow.co/snapchat-video-downloader",
  },
  twitter: {
    title: "Snapchat Video Downloader Free",
    description: "Save Snapchat videos free. Works on all devices.",
  },
};

const SnapchatVideoDownloaderPage = () => {
  return (
    <>
      <main>
        <SnapchatDownloader />
      </main>
      <PageContent
        description={snapchatContent.description}
        steps={snapchatContent.steps}
        features={snapchatContent.features}
        faqs={snapchatContent.faqs}
      />
    </>
  );
};

export default SnapchatVideoDownloaderPage;
