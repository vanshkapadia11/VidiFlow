"use client";

import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ArrowDownToLineIcon,
  UserIcon,
  HashIcon,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";
import PageContent from "@/components/pageContent";
import { redditContent } from "@/lib/page-content";

// ── Types ────────────────────────────────────────────────────────────────────

interface RedditFormat {
  quality: string;
  url: string;
  label: string;
  hasAudio?: boolean;
  isM3u8?: boolean;
}

interface RedditResult {
  success: boolean;
  type: string;
  postId: string;
  title: string;
  subreddit: string;
  author: string;
  thumbnail: string | null;
  duration: number;
  formats: RedditFormat[];
  images?: string[];
  defaultUrl: string;
  audioUrl?: string;
  note?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RedditDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [downloadingImg, setDownloadingImg] = React.useState<number | null>(
    null,
  );
  const [result, setResult] = React.useState<RedditResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] =
    React.useState<RedditFormat | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setSelectedFormat(null);

    try {
      const res = await fetch("/api/reddit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Server error (${res.status})`);
      setResult(data);
      setSelectedFormat(data.formats?.[0] ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat || !result || downloading) return;
    setDownloading(true);
    try {
      const proxyUrl = `/api/reddit-proxy?url=${encodeURIComponent(selectedFormat.url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Reddit-${result.postId}-${selectedFormat.quality}.mp4`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      setError("Download failed: " + (err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  const handleImageDownload = async (imgUrl: string, index: number) => {
    if (downloadingImg !== null) return;
    setDownloadingImg(index);
    const safeTitle =
      (result?.title || "reddit-image")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 50) || "RedditSave";
    try {
      const proxyUrl = `/api/reddit-proxy?url=${encodeURIComponent(imgUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("proxy failed");
      const blob = await res.blob();
      const ext = blob.type.includes("png")
        ? "png"
        : blob.type.includes("gif")
          ? "gif"
          : "jpg";
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeTitle}_${index + 1}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      // Fallback: open in new tab
      window.open(imgUrl, "_blank");
    } finally {
      setDownloadingImg(null);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
    setSelectedFormat(null);
  };

  const hasVideos = (result?.formats?.length ?? 0) > 0;
  const hasImages = (result?.images?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  RedditSave
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
                Videos, GIFs &amp; Images
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Reddit
              <span className="relative inline-block">
                <span className="text-orange-500">Save.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 140 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q35 2 70 4 Q105 6 138 2"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Download Reddit videos, GIFs, and images in full quality — no
              login, no watermarks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "1080p", label: "Max Quality" },
              { value: "MP4", label: "Video" },
              { value: "JPG", label: "Images" },
              { value: "Free", label: "Forever" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-3 px-4 bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
              >
                <span className="text-xl font-[900] italic text-zinc-900 leading-none">
                  {s.value}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-orange-500">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Reddit Downloader
                  </span>
                </div>

                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Reddit Post URL
                    </label>
                    <Input
                      placeholder="https://reddit.com/r/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-orange-500/20 focus-visible:border-orange-500/50 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <ArrowDownToLineIcon className="h-3.5 w-3.5" /> Get
                        Media
                      </span>
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* INFO PANEL */}
            <div className="p-5 bg-zinc-900 rounded-[24px] text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-orange-400">
                <ZapIcon className="h-3.5 w-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: "🎬",
                    label: "Reddit Videos",
                    desc: "v.redd.it videos up to 1080p",
                  },
                  {
                    icon: "🖼️",
                    label: "Photos & Galleries",
                    desc: "Full-res images & multi-image posts",
                  },
                  {
                    icon: "🎞️",
                    label: "GIFs & Gifv",
                    desc: "Converted to MP4",
                  },
                  {
                    icon: "📱",
                    label: "All Subreddits",
                    desc: "Public posts only",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-white text-[11px] font-bold leading-none">
                        {item.label}
                      </p>
                      <p className="text-zinc-500 text-[10px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  ⚠️ Only{" "}
                  <span className="text-orange-400 font-bold">public</span>{" "}
                  Reddit posts can be downloaded.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col transition-all">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center -rotate-6 border border-orange-100">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-12 h-12 fill-orange-200"
                      >
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                      <DownloadIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Reddit URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste a public Reddit post link to download its video,
                      GIF, or images.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  {/* POST INFO */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase font-black px-3 py-1">
                        <CheckCircle2Icon className="h-3 w-3 mr-1" /> Ready
                      </Badge>
                      {result.subreddit && (
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg uppercase bg-orange-50 text-orange-600 flex items-center gap-1">
                          <HashIcon className="h-2.5 w-2.5" /> r/
                          {result.subreddit}
                        </span>
                      )}
                      {result.author && (
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg uppercase bg-zinc-100 text-zinc-500 flex items-center gap-1">
                          <UserIcon className="h-2.5 w-2.5" /> u/{result.author}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 uppercase italic leading-tight line-clamp-2">
                      {result.title}
                    </h3>
                  </div>

                  {/* THUMBNAIL (video posts) */}
                  {result.thumbnail && hasVideos && (
                    <div className="relative rounded-2xl overflow-hidden bg-zinc-100 aspect-video">
                      <img
                        src={result.thumbnail}
                        alt="Reddit video thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* QUALITY SELECTOR */}
                  {hasVideos && result.formats.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Select Quality
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.formats.map((format) => (
                          <button
                            key={format.quality}
                            onClick={() => setSelectedFormat(format)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                              selectedFormat?.quality === format.quality
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            }`}
                          >
                            {format.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NOTE */}
                  {result.note && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold">
                      ℹ️ {result.note}
                    </div>
                  )}

                  {/* VIDEO DOWNLOAD BUTTON */}
                  {hasVideos && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleDownload}
                        disabled={downloading || !selectedFormat}
                        className="w-full h-14 text-white rounded-[20px] font-black uppercase text-sm shadow-xl transition-transform active:scale-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #ff4500, #ff6534)",
                          boxShadow: "0 8px 24px rgba(255,69,0,0.3)",
                        }}
                      >
                        {downloading ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          <span className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" />
                            Download {selectedFormat?.quality ?? ""} Video
                          </span>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* IMAGES SECTION */}
                  {hasImages && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          Photos ({result.images!.length})
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {result.images!.map((imgUrl, i) => (
                          <div
                            key={i}
                            className="relative group rounded-xl overflow-hidden border border-zinc-100 shadow-sm bg-zinc-50"
                          >
                            <img
                              src={imgUrl}
                              alt={`Photo ${i + 1}`}
                              className="w-full h-36 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                              <Button
                                onClick={() => handleImageDownload(imgUrl, i)}
                                disabled={downloadingImg !== null}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-9 px-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg scale-90 group-hover:scale-100"
                              >
                                {downloadingImg === i ? (
                                  <Loader2 className="animate-spin h-3 w-3" />
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <DownloadIcon className="h-3 w-3" /> Save
                                  </span>
                                )}
                              </Button>
                            </div>
                            {/* Index badge */}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {i + 1}/{result.images!.length}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Download all if multiple */}
                      {result.images!.length > 1 && (
                        <Button
                          onClick={async () => {
                            for (let i = 0; i < result.images!.length; i++) {
                              await handleImageDownload(result.images![i], i);
                              await new Promise((r) => setTimeout(r, 600));
                            }
                          }}
                          disabled={downloadingImg !== null}
                          className="w-full h-11 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >
                          <DownloadIcon className="h-3.5 w-3.5 mr-2" />
                          Download All {result.images!.length} Photos
                        </Button>
                      )}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    onClick={reset}
                    className="w-full text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px]"
                  >
                    <RotateCcwIcon className="mr-2 h-3.5 w-3.5" /> Start Fresh
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <PageContent
        description={redditContent.description}
        steps={redditContent.steps}
        features={redditContent.features}
        faqs={redditContent.faqs}
      />

      <CreatorFooter />
    </div>
  );
}
