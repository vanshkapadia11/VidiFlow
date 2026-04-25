import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import { videoSubtitlesContent } from "@/lib/page-content";
import VideoSubtitles from "./videoSubtitles";
import SubtitlesWaitlist from "./waitlist";

export const metadata: Metadata = {
  title: "YouTube Subtitle Generator — Free AI Subtitles Online",
  description:
    "Generate SRT & VTT subtitle files from any YouTube video instantly using AI. Free subtitle generator — no app, no account needed. Supports 99 languages. Works on iPhone, Android, and PC.",
  keywords: [
    "youtube subtitles",
    "subtitle generator",
    "srt generator",
    "vtt generator",
    "youtube to srt",
    "ai subtitle generator",
    "video subtitles online",
    "generate subtitles free",
  ],
  alternates: { canonical: "https://www.vidiflow.co/video-subtitles" },
  openGraph: {
    title: "YouTube Subtitle Generator — Free AI Subtitles",
    description:
      "Generate SRT & VTT subtitle files from any YouTube video instantly. Free, AI powered, no account needed.",
    url: "https://www.vidiflow.co/video-subtitles",
  },
  twitter: {
    title: "YouTube Subtitle Generator — Free AI",
    description:
      "Generate SRT & VTT subtitles from any YouTube video free. AI powered.",
  },
};

const SUBTITLES_ENABLED = process.env.NEXT_PUBLIC_SUBTITLES_ENABLED === "true";

export default function VideoSubtitlesPage() {
  if (!SUBTITLES_ENABLED) {
    return <SubtitlesWaitlist />;
  }

  return (
    <>
      <main>
        <VideoSubtitles />
      </main>
      <PageContent
        description={videoSubtitlesContent.description}
        steps={videoSubtitlesContent.steps}
        features={videoSubtitlesContent.features}
        faqs={videoSubtitlesContent.faqs}
      />
    </>
  );
}
