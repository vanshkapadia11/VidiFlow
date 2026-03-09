import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
// import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
import YouTubeThumbnailDownloader from "./ThumbNailDownloader";
import { youtubeThumbnailContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader — Download YouTube Thumbnails Free",
  description:
    "Download YouTube video thumbnails in full HD resolution for free. Get the thumbnail of any YouTube video instantly. Works on all devices. No signup needed.",
  keywords: [
    "youtube thumbnail downloader",
    "download youtube thumbnail",
    "youtube thumbnail hd",
    "youtube thumbnail grabber",
    "save youtube thumbnail",
    "youtube thumbnail free",
    "youtube cover image download",
  ],
  openGraph: {
    title: "YouTube Thumbnail Downloader — Free HD",
    description:
      "Download any YouTube video thumbnail in HD resolution. Free and instant.",
    url: "https://vidiflow.co/youtube-thumbnail-downloader",
  },
  twitter: {
    title: "YouTube Thumbnail Downloader Free",
    description: "Grab any YouTube thumbnail in HD. Free and instant.",
  },
};

const YoutubeThumbnailDownloader = () => {
  return (
    <>
      <main>
        <YouTubeThumbnailDownloader />
      </main>
      <PageContent
        description={youtubeThumbnailContent.description}
        steps={youtubeThumbnailContent.steps}
        features={youtubeThumbnailContent.features}
        faqs={youtubeThumbnailContent.faqs}
      />
    </>
  );
};

export default YoutubeThumbnailDownloader;
