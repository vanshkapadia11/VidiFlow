import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
import { youtubeVideoContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "YouTube Video Downloader — Download YouTube Videos Free in HD",
  description:
    "Download YouTube videos in HD, 1080p, 720p, 480p and 360p for free. Paste any YouTube link and save the video instantly. Works on all devices. No app needed.",
  keywords: [
    "youtube downloader",
    "youtube video downloader",
    "download youtube videos free",
    "youtube to mp4",
    "save youtube video",
    "youtube downloader online",
    "download youtube 1080p",
    "youtube downloader hd",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/youtube-video-downloader",
  },
  openGraph: {
    title: "YouTube Video Downloader — Free HD Download",
    description:
      "Download YouTube videos in 1080p, 720p and more. Free, fast, no app needed.",
    url: "https://www.vidiflow.co/youtube-video-downloader",
  },
  twitter: {
    title: "YouTube Video Downloader — Free HD",
    description: "Save YouTube videos in HD quality. Free and instant.",
  },
};

const YoutubeDownloaderPage = () => {
  return (
    <>
      <main>
        <YouTubeDownloaderComingSoon />
      </main>
      <PageContent
        description={youtubeVideoContent.description}
        steps={youtubeVideoContent.steps}
        features={youtubeVideoContent.features}
        faqs={youtubeVideoContent.faqs}
      />
    </>
  );
};

export default YoutubeDownloaderPage;
