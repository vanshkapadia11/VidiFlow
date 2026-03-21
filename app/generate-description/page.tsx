import React from "react";
import CreatorFooter from "@/components/footer";

import PageContent from "@/components/pageContent";
import CreatorArchitect from "./GenerateDesc";
import { Metadata } from "next";
import { creatorArchitectContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Creator Architect — AI Video Script & Brand Blueprint Tool",
  description:
    "Build professional video structures, hooks, and channel brand identities. Use AI to architect your content strategy and streamline your creative workflow.",
  keywords: [
    "video script generator",
    "content creator tools",
    "video hook generator",
    "channel identity builder",
    "creator architect",
    "ai video planner",
    "youtube strategy tool",
    "content blueprint",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/generate-description",
  },
  openGraph: {
    title: "Creator Architect — Build Better Content",
    description:
      "Architect your next viral video. Professional script structures and brand identity tools for creators.",
    url: "https://www.vidiflow.co/generate-description",
  },
  twitter: {
    title: "Creator Architect — AI Content Blueprint",
    description:
      "Build high-converting video scripts and brand strategies with AI.",
  },
};

const GenerateDescPage = () => {
  return (
    <>
      <main>
        <CreatorArchitect />
      </main>
      <PageContent
        description={creatorArchitectContent.description}
        steps={creatorArchitectContent.steps}
        features={creatorArchitectContent.features}
        faqs={creatorArchitectContent.faqs}
      />
    </>
  );
};

export default GenerateDescPage;
