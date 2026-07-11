import React from "react";
import PinterestDownloader from "./LinkedInDownloader";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import LinkedInDownloader from "./LinkedInDownloader";
import { linkedinContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "LinkedIn Video Downloader — Download LinkedIn Videos Free",
  description:
    "Download LinkedIn videos and posts for free. Paste any LinkedIn video link and save instantly in HD quality. Works on all devices. No app or login needed.",
  keywords: [
    "linkedin video downloader",
    "download linkedin videos",
    "linkedin downloader",
    "save linkedin video",
    "linkedin video download free",
    "linkedin to mp4",
    "linkedin post video download",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/linkedin-video-downloader",
  },
  openGraph: {
    title: "LinkedIn Video Downloader — Free",
    description:
      "Download LinkedIn videos for free. HD quality, works on all devices.",
    url: "https://www.vidiflow.co/linkedin-video-downloader",
  },
  twitter: {
    title: "LinkedIn Video Downloader Free",
    description: "Save LinkedIn videos free. Works on all devices.",
  },
};

const LinkedinDownloaderPage = () => {
  return (
    <>
      <main>
        <LinkedInDownloader />
      </main>
      <PageContent
        description={linkedinContent.description}
        steps={linkedinContent.steps}
        features={linkedinContent.features}
        faqs={linkedinContent.faqs}
      />
      {/* <CreatorFooter /> */}
    </>
  );
};

export default LinkedinDownloaderPage;
