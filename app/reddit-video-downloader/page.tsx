// app/reddit-video-downloader/page.tsx
import type { Metadata } from "next";
import RedditDownloader from "./reddit-downloader";
import PageContent from "@/components/pageContent";
import { redditContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Reddit Video Downloader — Download Reddit Videos & GIFs Free",
  description:
    "Download Reddit videos and GIFs for free. Paste any Reddit post link and save instantly in HD quality. Works on iPhone, Android and PC. No app needed.",
  keywords: [
    "reddit video downloader",
    "download reddit videos",
    "reddit downloader",
    "save reddit video",
    "reddit gif downloader",
    "reddit to mp4",
    "download reddit free",
    "redd.it downloader",
    "vreddit downloader",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/reddit-video-downloader",
  },

  openGraph: {
    title: "Reddit Video Downloader — Free",
    description:
      "Download Reddit videos and GIFs for free. HD quality, works on all devices.",
    url: "https://www.vidiflow.co/reddit-video-downloader",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reddit Video Downloader Free",
    description: "Save Reddit videos and GIFs free. Works on all devices.",
  },
};

export default function Page() {
  return <RedditDownloader />;
}
