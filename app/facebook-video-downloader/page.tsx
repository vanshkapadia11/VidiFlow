import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import FacebookDownloader from "./FacebookDownloader";
// import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
import { facebookContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Facebook Video Downloader — Download Facebook Videos Free",
  description:
    "Download Facebook videos in HD and SD quality for free. Save public Facebook videos, Reels and Watch videos instantly. Works on all devices. No app needed.",
  keywords: [
    "facebook video downloader",
    "download facebook videos",
    "facebook downloader",
    "save facebook video",
    "facebook video download free",
    "facebook reels downloader",
    "facebook to mp4",
    "fb video downloader",
  ],
  openGraph: {
    title: "Facebook Video Downloader — Free HD Download",
    description:
      "Download Facebook videos and Reels for free. HD quality, works on all devices.",
    url: "https://vidiflow.co/facebook-video-downloader",
  },
  twitter: {
    title: "Facebook Video Downloader Free",
    description: "Save Facebook videos in HD free. Works on all devices.",
  },
};

const FacebookVideoDownloaderPage = () => {
  return (
    <>
      <main>
        <FacebookDownloader />
      </main>
      <PageContent
        description={facebookContent.description}
        steps={facebookContent.steps}
        features={facebookContent.features}
        faqs={facebookContent.faqs}
      />
    </>
  );
};

export default FacebookVideoDownloaderPage;
