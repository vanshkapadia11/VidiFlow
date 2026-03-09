import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import TikTokDownloader from "./tiktokDownloader";
import { tiktokContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "TikTok Video Downloader — Download TikTok Without Watermark Free",
  description:
    "Download TikTok videos without watermark in HD quality for free. Paste any TikTok link and save the video instantly. Works on iPhone, Android, and PC. No app needed.",
  keywords: [
    "tiktok downloader",
    "tiktok video downloader",
    "download tiktok without watermark",
    "tiktok video download no watermark",
    "save tiktok video",
    "tiktok downloader online free",
    "tiktok to mp4",
  ],
  openGraph: {
    title: "TikTok Video Downloader — No Watermark, Free",
    description:
      "Download TikTok videos without watermark instantly. Free, no app, works on all devices.",
    url: "https://vidiflow.co/tiktok-video-downloader",
  },
  twitter: {
    title: "TikTok Video Downloader — No Watermark Free",
    description: "Save TikTok videos without watermark. Free and instant.",
  },
};

const TikTokDownloaderPage = () => {
  return (
    <>
      <main>
        <TikTokDownloader />
      </main>
      <PageContent
        description={tiktokContent.description}
        steps={tiktokContent.steps}
        features={tiktokContent.features}
        faqs={tiktokContent.faqs}
      />
      {/* <CreatorFooter /> */}
    </>
  );
};

export default TikTokDownloaderPage;
