import { Metadata } from "next";
import ExploreFeatures from "./ExploreFeatures";

export const metadata: Metadata = {
  title: "All Video Downloaders — Every Tool in One Place | VidiFlow",
  description:
    "Browse all free video downloader tools on VidiFlow. Download from TikTok, YouTube, Instagram, Facebook, Pinterest, Snapchat, Twitter, LinkedIn and Twitch. All tools free, no app needed.",
  alternates: { canonical: "https://www.vidiflow.co/explore-tools" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ExploreFeatures />;
}
