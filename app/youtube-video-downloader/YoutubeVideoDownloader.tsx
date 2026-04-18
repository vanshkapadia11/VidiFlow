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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";

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

export default function YouTubeVideoDownloader() {
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [videoInfo, setVideoInfo] = React.useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = React.useState("720p");

  const isValidYouTubeUrl = (val: string) =>
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(
      val,
    );

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // auto-select best available quality
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
              YouTube → MP4 in HD. Paste, pick quality, download.
            </p>
          </div>
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
                      disabled={!url}
                      className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200 disabled:opacity-60"
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
                  <span>Hit Fetch Info — preview the video details.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-red-500 font-black">3.</span>
                  <span>Pick a quality and click Download MP4.</span>
                </div>
                <p className="text-zinc-500 pt-1 text-[10px]">
                  Large videos can take up to 60 seconds. Please wait.
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
                      Paste a YouTube URL on the left and hit{" "}
                      <span className="text-zinc-600 font-semibold">
                        Fetch Info
                      </span>{" "}
                      — the video preview and download options will appear here.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    {[
                      "4K / 1080p / 720p",
                      "YouTube Shorts",
                      "No Signup",
                      "Free Forever",
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
                    {/* Thumbnail */}
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

                    {/* Info + quality + download */}
                    <div className="flex-1 p-7 flex flex-col gap-5">
                      {/* Title + meta */}
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

                      {/* Quality picker */}
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

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Status alerts */}
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

                      {/* Download button */}
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

                      {/* Reset */}
                      <Button
                        onClick={handleReset}
                        className="w-full text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors font-medium tracking-widest uppercase"
                        variant="link"
                      >
                        ← Search another video
                      </Button>
                    </div>
                  </div>
                )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
