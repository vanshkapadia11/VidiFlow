import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
// import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
import TwitterDownloader from "./TwitterVideoDownloader";
import { twitterContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Twitter Video Downloader — Download X Videos & GIFs Free",
  description:
    "Download Twitter and X videos, GIFs and clips for free. Paste any Tweet link and save the video instantly in HD quality. Works on all devices. No app needed.",
  keywords: [
    "twitter video downloader",
    "x video downloader",
    "download twitter videos",
    "twitter downloader",
    "save twitter video",
    "twitter gif downloader",
    "tweet video download",
    "twitter to mp4",
    "x downloader free",
  ],
  openGraph: {
    title: "Twitter / X Video Downloader — Free",
    description:
      "Download Twitter and X videos and GIFs for free. HD quality, works on all devices.",
    url: "https://vidiflow.co/twitter-downloader",
  },
  twitter: {
    title: "Twitter Video Downloader Free",
    description: "Save Twitter and X videos free. HD quality.",
  },
};

const TwitterVideoDownloaderPage = () => {
  return (
    <>
      <main>
        <TwitterDownloader />
      </main>
      <PageContent
        description={twitterContent.description}
        steps={twitterContent.steps}
        features={twitterContent.features}
        faqs={twitterContent.faqs}
      />
    </>
  );
};

export default TwitterVideoDownloaderPage;
