"use client";

import * as React from "react";
import {
  VideoIcon,
  DownloadIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircleIcon,
  LinkIcon,
  SearchIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

interface VideoInfo {
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  formats: { quality: string; label: string; size: string; ext: string }[];
}

type Status =
  | "idle"
  | "fetching"
  | "ready"
  | "downloading"
  | "success"
  | "error";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const faqs = [
  {
    q: "Is it legal to download YouTube videos?",
    a: "Downloading YouTube videos without permission from the copyright holder may violate YouTube's Terms of Service (Section 5) and applicable copyright laws. VidiFlow is intended solely for content you own, have explicit permission to download, or that is in the public domain. Always verify you have the right to download before proceeding.",
  },
  {
    q: "What video qualities are available?",
    a: "Available resolutions depend on the source video. VidiFlow fetches all formats the video offers, which can include 4K (2160p), 1080p Full HD, 720p HD, 480p, and 360p. Once you fetch the video info, you'll see exactly which qualities are available for that specific video.",
  },
  {
    q: "Why is the download taking a long time?",
    a: "High-resolution videos (1080p, 4K) and longer videos naturally take more time to process and deliver. Downloads can take up to 60 seconds for larger files. Please keep the tab open and avoid navigating away during the download.",
  },
  {
    q: "Can I download YouTube Shorts?",
    a: "Yes. VidiFlow fully supports YouTube Shorts. Paste the Shorts URL exactly as it appears in your browser (e.g. youtube.com/shorts/...) and it will be processed just like a regular video.",
  },
  {
    q: "Does VidiFlow store the downloaded videos?",
    a: "No. VidiFlow does not store, cache, or retain any downloaded video files on our servers. All processing is transient and the file is delivered directly to your browser. We do not log video IDs or user data associated with downloads.",
  },
  {
    q: "Why might a download fail or be unavailable?",
    a: "Downloads may fail for age-restricted videos, region-locked content, live streams, private videos, or videos that have been removed. Platform-level changes on YouTube's end may also temporarily affect availability. If a download fails, try again after a few minutes.",
  },
  {
    q: "Can I use downloaded videos commercially?",
    a: "No, unless you hold the appropriate rights or license for the content. Downloaded videos must only be used in ways permitted by the copyright holder and applicable law. Redistribution, re-uploading, or commercial use of copyrighted content without authorization is illegal.",
  },
];

export default function YouTubeVideoDownloader() {
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [videoInfo, setVideoInfo] = React.useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = React.useState("720p");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const isValidYouTubeUrl = (val: string) =>
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(
      val,
    );

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg(
        "Please confirm you agree to our usage policy before continuing.",
      );
      setStatus("error");
      return;
    }
    if (!url.trim() || !isValidYouTubeUrl(url)) {
      setErrorMsg("Please enter a valid YouTube URL.");
      setStatus("error");
      return;
    }
    setStatus("fetching");
    setErrorMsg("");
    setVideoInfo(null);
    try {
      const res = await fetch("/api/youtube-video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Failed to fetch video info");

      setVideoInfo({
        title: data.title,
        author: data.author,
        duration: data.duration,
        thumbnail: data.thumbnail,
        videoId: data.videoId,
        formats: data.formats || [],
      });
      if (data.formats?.length > 0) {
        setSelectedQuality(data.formats[0].quality);
      }
      setStatus("ready");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) return;
    setStatus("downloading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/youtube-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), quality: selectedQuality }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const filename = match
        ? match[1].replace(/['"]/g, "")
        : `${videoInfo?.title || "video"}_${selectedQuality}.mp4`;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setStatus("success");
      setTimeout(() => setStatus("ready"), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setUrl("");
    setStatus("idle");
    setErrorMsg("");
    setVideoInfo(null);
    setSelectedQuality("720p");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-red-50 text-red-600 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Free Tool
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              YTSave<span className="text-red-600">.</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              YouTube → MP4 in HD. For personal &amp; permitted use only.
            </p>
          </div>
        </div>

        {/* ── LEGAL NOTICE BANNER ── */}
        <div className="mb-8 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl">
          <AlertTriangleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <span className="font-black uppercase">Important:</span> This tool
            is intended only for downloading content you own, have explicit
            permission to use, or that is licensed under Creative Commons /
            public domain. Downloading copyrighted videos or other protected
            content without authorization may violate{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-amber-900"
            >
              YouTube's Terms of Service
            </a>{" "}
            and applicable copyright law. VidiFlow is not responsible for misuse
            of this tool.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT — input + how it works ── */}
          <div className="lg:col-span-4 space-y-5">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <VideoIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    YouTube to MP4
                  </span>
                </div>

                <form onSubmit={handleFetchInfo} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      YouTube URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                      <Input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (status === "error") setStatus("idle");
                          if (status === "ready" || status === "success") {
                            setVideoInfo(null);
                            setStatus("idle");
                          }
                        }}
                        className="h-12 pl-10 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-red-500/20 focus-visible:border-red-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${acceptedTerms ? "bg-red-600 border-red-600" : "border-zinc-300 bg-white group-hover:border-zinc-400"}`}
                      >
                        {acceptedTerms && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M1.5 5L4 7.5L8.5 2.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-relaxed">
                      I confirm I have the right to download this content and
                      agree to VidiFlow's{" "}
                      <a
                        href="/terms"
                        className="text-red-600 underline underline-offset-2 hover:text-red-700"
                      >
                        Terms of Use
                      </a>
                      . I will not use this tool to download copyrighted content
                      without permission.
                    </span>
                  </label>

                  {status === "error" && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                      <AlertCircleIcon className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600 font-medium">
                        {errorMsg}
                      </p>
                    </div>
                  )}

                  {(status === "idle" || status === "error") && (
                    <Button
                      type="submit"
                      disabled={!url || !acceptedTerms}
                      className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200 disabled:opacity-40"
                    >
                      <span className="flex items-center gap-2">
                        <SearchIcon className="h-3.5 w-3.5" />
                        Fetch Video Info
                      </span>
                    </Button>
                  )}

                  {status === "fetching" && (
                    <Button
                      disabled
                      className="w-full h-12 bg-zinc-900 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest opacity-60"
                    >
                      <span className="flex items-center gap-2">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Fetching info…
                      </span>
                    </Button>
                  )}

                  {(status === "ready" ||
                    status === "downloading" ||
                    status === "success") && (
                    <Button
                      type="submit"
                      className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <SearchIcon className="h-3.5 w-3.5" />
                        Fetch Another
                      </span>
                    </Button>
                  )}

                  <p className="text-[10px] text-zinc-400 text-center">
                    Works with YouTube videos &amp; Shorts
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="p-5 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <VideoIcon className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  How it works
                </span>
              </div>
              <div className="space-y-2.5 text-zinc-300 text-[11px] leading-relaxed">
                <div className="flex gap-2.5">
                  <span className="text-red-500 font-black">1.</span>
                  <span>Paste any YouTube or Shorts URL above.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-red-500 font-black">2.</span>
                  <span>Confirm you have rights to the content.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-red-500 font-black">3.</span>
                  <span>Hit Fetch Info — preview the video details.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-red-500 font-black">4.</span>
                  <span>Pick a quality and click Download MP4.</span>
                </div>
                <p className="text-zinc-500 pt-1 text-[10px]">
                  Large videos can take up to 60 seconds. Please wait.
                </p>
              </div>
            </div>

            {/* Permitted use card */}
            <div className="p-5 bg-white border border-zinc-200/60 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Permitted Use Only
                </span>
              </div>
              <ul className="space-y-2 text-[11px] text-zinc-500 leading-relaxed">
                {[
                  "Your own uploaded videos",
                  "Creative Commons licensed content",
                  "Public domain recordings",
                  "Content with explicit owner permission",
                  "Videos you have purchased rights to",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-1 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Downloading copyrighted films, shows, or other protected
                  material without authorization is{" "}
                  <span className="font-bold text-red-500">not permitted</span>{" "}
                  and may result in legal liability.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT — preview + quality picker + download ── */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col">
              {/* DEFAULT */}
              {!videoInfo && status !== "fetching" && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20 scale-150" />
                    <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse opacity-40 scale-125" />
                    <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-200 rotate-3">
                      <VideoIcon className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    <h2 className="text-3xl font-black uppercase italic text-zinc-900 leading-tight">
                      YouTube Video
                      <br />
                      <span className="text-red-600">Downloader</span>
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Paste a YouTube URL on the left, confirm your usage
                      rights, and hit{" "}
                      <span className="text-zinc-600 font-semibold">
                        Fetch Info
                      </span>{" "}
                      — the video preview and quality options will appear here.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    {[
                      "4K / 1080p / 720p",
                      "YouTube Shorts",
                      "No Signup",
                      "Personal Use",
                    ].map((tag) => (
                      <div
                        key={tag}
                        className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black uppercase text-zinc-500 tracking-wider"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FETCHING */}
              {status === "fetching" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Loader2Icon className="h-8 w-8 text-red-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-700 text-sm font-bold">
                      Fetching video details…
                    </p>
                    <p className="text-zinc-400 text-xs">
                      This usually takes a few seconds.
                    </p>
                  </div>
                </div>
              )}

              {/* VIDEO READY */}
              {videoInfo &&
                (status === "ready" ||
                  status === "downloading" ||
                  status === "success") && (
                  <div className="flex-1 flex flex-col">
                    <div className="relative w-full aspect-video bg-zinc-100 shrink-0">
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          MP4
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {formatDuration(videoInfo.duration)}
                      </div>
                    </div>

                    <div className="flex-1 p-7 flex flex-col gap-5">
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-zinc-900 leading-snug line-clamp-2">
                          {videoInfo.title}
                        </h2>
                        <div className="flex items-center gap-4 text-zinc-400 text-sm flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <UserIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {videoInfo.author}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{formatDuration(videoInfo.duration)}</span>
                          </span>
                        </div>
                      </div>

                      {videoInfo.formats.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Select Quality
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {videoInfo.formats.map((f) => (
                              <button
                                key={f.quality}
                                onClick={() => setSelectedQuality(f.quality)}
                                disabled={status === "downloading"}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${
                                  selectedQuality === f.quality
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                                }`}
                              >
                                {f.quality}
                                {f.size && (
                                  <span className="ml-1.5 opacity-60 font-normal normal-case tracking-normal">
                                    {f.size}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex-1" />

                      {status === "success" && (
                        <div className="flex items-center gap-2 p-3.5 bg-green-50 rounded-xl border border-green-100">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                          <p className="text-xs text-green-700 font-medium">
                            Video downloaded successfully!
                          </p>
                        </div>
                      )}

                      {status === "downloading" && (
                        <div className="flex items-center gap-2 p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                          <Loader2Icon className="h-4 w-4 text-amber-500 animate-spin shrink-0" />
                          <p className="text-xs text-amber-700 font-medium">
                            Downloading {selectedQuality}… do not close this
                            tab.
                          </p>
                        </div>
                      )}

                      {status === "ready" && (
                        <Button
                          onClick={handleDownload}
                          className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-red-100"
                        >
                          <span className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" />
                            Download {selectedQuality} MP4
                          </span>
                        </Button>
                      )}

                      {status === "downloading" && (
                        <Button
                          disabled
                          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest opacity-60"
                        >
                          <span className="flex items-center gap-2">
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                            Downloading… please wait
                          </span>
                        </Button>
                      )}

                      {status === "success" && (
                        <Button
                          onClick={handleDownload}
                          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-red-100"
                        >
                          <span className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" />
                            Download Again
                          </span>
                        </Button>
                      )}

                      <button
                        onClick={handleReset}
                        className="w-full text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors font-medium tracking-widest uppercase"
                      >
                        ← Search another video
                      </button>
                    </div>
                  </div>
                )}
            </Card>
          </div>
        </div>

        {/* ── FAQ / LEGAL SECTION ── */}
        <section className="mt-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                Legal & Usage
              </p>
              <h2 className="text-3xl font-black uppercase italic tracking-tight leading-tight">
                Common <span className="text-red-600">Questions.</span>
              </h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-xs text-right hidden md:block">
              Please read before using this tool.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200/60 rounded-[20px] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="font-black text-sm uppercase tracking-tight text-zinc-800 group-hover:text-red-600 transition-colors pr-4">
                    {faq.q}
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-zinc-100">
                    <p className="text-zinc-500 text-sm leading-relaxed pt-4">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── DISCLAIMER FOOTER BLOCK ── */}
        <section className="mt-16 p-8 bg-zinc-900 rounded-[32px] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                Legal Disclaimer
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-4xl">
              VidiFlow is an independent tool and is{" "}
              <span className="text-white font-bold">
                not affiliated with, endorsed by, or sponsored by YouTube,
                Google LLC, or any of their subsidiaries.
              </span>{" "}
              All product names, logos, and brands are property of their
              respective owners.
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-4xl">
              This tool is provided strictly for{" "}
              <span className="text-zinc-300 font-semibold">
                personal, non-commercial use
              </span>{" "}
              on content you own or have explicit rights to download.
              Downloading, reproducing, or distributing copyrighted content
              without authorization from the rights holder may constitute
              copyright infringement under applicable law, including but not
              limited to the Digital Millennium Copyright Act (DMCA) and the EU
              Copyright Directive.
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-4xl">
              VidiFlow does not host, store, or distribute any copyrighted
              content. We act solely as a technical intermediary and are not
              liable for how users choose to use this tool. By using VidiFlow,
              you agree to take full responsibility for ensuring your downloads
              comply with applicable laws and platform terms.
            </p>
            <p className="text-zinc-600 text-[10px] leading-relaxed max-w-4xl pt-2 border-t border-zinc-800">
              For DMCA notices or copyright concerns, please contact us at{" "}
              <a
                href="mailto:legal@vidiflow.co"
                className="text-red-500 underline underline-offset-2 hover:text-red-400"
              >
                legal@vidiflow.co
              </a>
              . We respond to valid takedown requests within 48 hours.
            </p>
          </div>
        </section>
      </main>
      {/* <CreatorFooter /> */}
    </div>
  );
}
