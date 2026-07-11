import React from "react";
import CreatorFooter from "@/components/footer";
import { Metadata } from "next";
import PageContent from "@/components/pageContent";
// import YouTubeDownloaderComingSoon from "./YoutubeVideoDownloader";
import EnhancedTagGenerator from "./GenerateTags";
import { tagGeneratorContent } from "@/lib/page-content";

// import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ViralTags — YouTube Tag Generator & SEO Engine (2026)",
  description:
    "Generate high-ranking YouTube tags and hashtags instantly. Optimized for the 2026 algorithm to help your videos go viral. Free AI-powered SEO keyword tool.",
  keywords: [
    "youtube tag generator",
    "viral tags",
    "youtube seo tool",
    "video keyword generator",
    "youtube hashtag generator",
    "get more views youtube",
    "trending youtube tags",
    "youtube seo 2026",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/generate-tags",
  },
  openGraph: {
    title: "ViralTags — YouTube SEO & Tag Generator",
    description:
      "Boost your video ranking with AI-generated tags and viral SEO strategies. Free for creators.",
    url: "https://www.vidiflow.co/generate-tags",
  },
  twitter: {
    title: "ViralTags — YouTube SEO Tool",
    description: "Generate viral YouTube tags and rank higher instantly.",
  },
};

const YoutubeTagsPage = () => {
  return (
    <>
      <main>
        <EnhancedTagGenerator />
      </main>
      <PageContent
        description={tagGeneratorContent.description}
        steps={tagGeneratorContent.steps}
        features={tagGeneratorContent.features}
        faqs={tagGeneratorContent.faqs}
      />
    </>
  );
};

export default YoutubeTagsPage;
