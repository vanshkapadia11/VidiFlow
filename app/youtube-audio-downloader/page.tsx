import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
// import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
// import YouTubeAudioDownloader from "./YoutubeAudioDownloader";
import { youtubeAudioContent } from "@/lib/page-content";
import YouTubeAudioDownloader from "./YoutubeAudioDownloader";

export const metadata: Metadata = {
  title: "YouTube to MP3 Converter — Download YouTube Audio Free",
  description:
    "Convert YouTube videos to MP3 audio for free. Download YouTube audio in 320kbps, 256kbps and 128kbps quality. Fast, free, works on all devices. No app needed.",
  keywords: [
    "youtube to mp3",
    "youtube mp3 converter",
    "youtube audio downloader",
    "download youtube audio",
    "convert youtube to mp3 free",
    "youtube to mp3 320kbps",
    "youtube music downloader",
    "youtube mp3 download",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/youtube-audio-downloader",
  },
  openGraph: {
    title: "YouTube to MP3 Converter — Free Audio Download",
    description:
      "Convert any YouTube video to MP3 instantly. Up to 320kbps quality, free forever.",
    url: "https://www.vidiflow.co/youtube-audio-downloader",
  },
  twitter: {
    title: "YouTube to MP3 — Free Converter",
    description: "Convert YouTube to MP3 free. Up to 320kbps quality.",
  },
};

const YoutubeAudioDownloadPage = () => {
  return (
    <>
      <main>
        <YouTubeAudioDownloader />
      </main>
      <PageContent
        description={youtubeAudioContent.description}
        steps={youtubeAudioContent.steps}
        features={youtubeAudioContent.features}
        faqs={youtubeAudioContent.faqs}
      />
    </>
  );
};

export default YoutubeAudioDownloadPage;
