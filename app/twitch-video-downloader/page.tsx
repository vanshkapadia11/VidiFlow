import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import TwitchDownloader from "./TwitchVideoDownloader";
import { twitchContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Twitch Clip Downloader — Download Twitch Clips & VODs Free",
  description:
    "Download Twitch clips and VODs for free. Paste any Twitch clip link and save instantly in HD quality. Works on all devices. No app or Twitch account needed.",
  keywords: [
    "twitch clip downloader",
    "download twitch clips",
    "twitch downloader",
    "save twitch clip",
    "twitch vod downloader",
    "twitch video download free",
    "twitch to mp4",
    "twitch clip save",
  ],
  openGraph: {
    title: "Twitch Clip Downloader — Free",
    description:
      "Download Twitch clips and VODs for free. HD quality, works on all devices.",
    url: "https://vidiflow.co/twitch-downloader",
  },
  twitter: {
    title: "Twitch Clip Downloader Free",
    description: "Save Twitch clips and VODs free. Works on all devices.",
  },
};

const TwitchVideoDownloaderPage = () => {
  return (
    <>
      <main>
        <TwitchDownloader />
      </main>
      <PageContent
        description={twitchContent.description}
        steps={twitchContent.steps}
        features={twitchContent.features}
        faqs={twitchContent.faqs}
      />
    </>
  );
};

export default TwitchVideoDownloaderPage;
