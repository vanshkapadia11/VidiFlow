import { Metadata } from "next";
import PageContent from "@/components/pageContent";
import { videoTranscriberContent } from "@/lib/page-content";
import VideoTranscriber from "./videoTranscriber";
import TranscriberWaitlist from "./waitlist";

export const metadata: Metadata = {
  title: "Video to Text Transcriber — Free AI Transcription Online",
  description:
    "Convert any YouTube video to text instantly using AI. Free video transcriber — no app, no account needed. Supports 99 languages. Works on iPhone, Android, and PC.",
  keywords: [
    "video to text",
    "video transcriber",
    "youtube transcriber",
    "transcribe video free",
    "video to text converter",
    "ai transcription online",
    "youtube to text",
  ],
  alternates: { canonical: "https://www.vidiflow.co/video-transcriber" },
  openGraph: {
    title: "Video to Text Transcriber — Free AI Transcription",
    description:
      "Convert any YouTube video to text instantly. Free, AI powered, no account needed.",
    url: "https://www.vidiflow.co/video-transcriber",
  },
  twitter: {
    title: "Video to Text Transcriber — Free AI",
    description: "Transcribe any YouTube video to text free. AI powered.",
  },
};

const TRANSCRIBER_ENABLED =
  process.env.NEXT_PUBLIC_TRANSCRIBER_ENABLED === "true";

export default function VideoTranscriberPage() {
  if (!TRANSCRIBER_ENABLED) {
    return <TranscriberWaitlist />;
  }

  return (
    <>
      <main>
        <VideoTranscriber />
      </main>
      <PageContent
        description={videoTranscriberContent.description}
        steps={videoTranscriberContent.steps}
        features={videoTranscriberContent.features}
        faqs={videoTranscriberContent.faqs}
      />
    </>
  );
}
