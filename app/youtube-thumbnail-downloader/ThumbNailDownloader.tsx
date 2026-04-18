"use client";

import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ImageIcon,
  YoutubeIcon,
  Link2Icon,
  ZapIcon,
  CheckIcon,
  AlertCircleIcon,
  SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

interface Thumbnail {
  key: string;
  url: string;
  label: string;
  size: string;
  badge: string;
  available: boolean;
  note?: string;
}

interface ThumbnailResult {
  title?: string;
  author?: string;
  videoId: string;
  thumbnails: Thumbnail[];
}

export default function YouTubeThumbnailDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ThumbnailResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/youtube-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Server error (${res.status})`);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (thumb: Thumbnail) => {
    if (downloading) return;
    setDownloading(thumb.key);
    const safeTitle = (result?.title || "thumbnail")
      .replace(/[^a-zA-Z0-9\s_-]/g, "")
      .trim()
      .substring(0, 50);
    const filename = `${safeTitle}-${thumb.key}`;
    try {
      const proxyUrl = `/api/thumbnail-proxy?url=${encodeURIComponent(thumb.url)}&filename=${encodeURIComponent(filename)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        const link = document.createElement("a");
        link.href = thumb.url;
        link.download = `${filename}.jpg`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      setError("Download failed: " + (err as Error).message);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!result) return;
    const available = result.thumbnails.filter((t) => t.available);
    for (const thumb of available) {
      await handleDownload(thumb);
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const copyUrl = (thumb: Thumbnail) => {
    navigator.clipboard.writeText(thumb.url);
    setCopied(thumb.key);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  const badgeColors: Record<string, string> = {
    HD: "bg-red-50 text-red-600",
    SD: "bg-orange-50 text-orange-600",
    HQ: "bg-yellow-50 text-yellow-600",
    MQ: "bg-zinc-100 text-zinc-500",
    SM: "bg-zinc-100 text-zinc-400",
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                  <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Thumbnail Tool v1.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                All Resolutions Available
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Thumb
              <span className="relative inline-block">
                <span className="text-red-600">Rip.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 120 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q30 2 60 4 Q90 6 118 2"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Extract full-resolution YouTube thumbnails in every available size
              — instantly, no login needed.
            </p>
          </div>

          {/* Stats strip — matches explore page */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "4K", label: "Max Quality" },
              { value: "HD", label: "All Sizes" },
              { value: "JPG", label: "Format" },
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
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <ImageIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Thumbnail Extractor
                  </span>
                </div>
                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> YouTube URL
                    </label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-red-500/20 focus-visible:border-red-500/50 transition-all"
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
                        <ImageIcon className="h-3.5 w-3.5" /> Get Thumbnails
                      </span>
                    )}
                  </Button>
                </form>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" /> {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Available Sizes
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Max HD", size: "1280×720", badge: "HD" },
                  { label: "Standard", size: "640×480", badge: "SD" },
                  { label: "High Quality", size: "480×360", badge: "HQ" },
                  { label: "Medium", size: "320×180", badge: "MQ" },
                ].map((item) => (
                  <div
                    key={item.badge}
                    className="flex items-center justify-between"
                  >
                    <span className="text-zinc-400 text-[11px]">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-[10px] font-mono">
                        {item.size}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badge === "HD" ? "bg-red-500/20 text-red-400" : "bg-zinc-700 text-zinc-400"}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <Button
                onClick={handleDownloadAll}
                disabled={!!downloading}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest"
              >
                {downloading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <span className="flex items-center gap-2">
                    <DownloadIcon className="h-3.5 w-3.5" /> Download All Sizes
                  </span>
                )}
              </Button>
            )}
          </div>

          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[500px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-50 flex items-center justify-center rotate-3 border border-zinc-100">
                    <YoutubeIcon className="h-8 w-8 text-zinc-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[200px] leading-relaxed lowercase italic">
                      Paste any YouTube link to extract all available thumbnail
                      sizes instantly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3 pb-5 border-b border-zinc-100">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <YoutubeIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-zinc-900 text-sm truncate">
                        {result.title || "YouTube Video"}
                      </p>
                      {result.author && (
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          {result.author}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={reset}
                      className="ml-auto text-zinc-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <RotateCcwIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.thumbnails
                      .filter((t) => t.available)
                      .map((thumb) => (
                        <div
                          key={thumb.key}
                          className="group rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all hover:shadow-md"
                        >
                          <div className="relative bg-zinc-50 aspect-video overflow-hidden">
                            <img
                              src={thumb.url}
                              alt={thumb.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://i.ytimg.com/vi/${result.videoId}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDownload(thumb)}
                                  disabled={!!downloading}
                                  className="bg-white text-zinc-900 rounded-full p-2 shadow-lg hover:bg-red-600 hover:text-white transition-all"
                                >
                                  {downloading === thumb.key ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <DownloadIcon className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => copyUrl(thumb)}
                                  className="bg-white text-zinc-900 rounded-full p-2 shadow-lg hover:bg-zinc-900 hover:text-white transition-all"
                                >
                                  {copied === thumb.key ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <svg
                                      className="h-4 w-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <rect
                                        x="9"
                                        y="9"
                                        width="13"
                                        height="13"
                                        rx="2"
                                      />
                                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="absolute top-2 left-2">
                              <span
                                className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${badgeColors[thumb.badge] || "bg-zinc-100 text-zinc-500"}`}
                              >
                                {thumb.badge}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 flex items-center justify-between bg-white">
                            <div>
                              <p className="text-[11px] font-bold text-zinc-700">
                                {thumb.label}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-mono">
                                {thumb.size}
                              </p>
                              {thumb.note && (
                                <p className="text-[9px] text-orange-500 font-bold mt-0.5">
                                  {thumb.note}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => copyUrl(thumb)}
                                className="p-2 rounded-lg hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 transition-colors"
                                title="Copy URL"
                              >
                                {copied === thumb.key ? (
                                  <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <svg
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <rect
                                      x="9"
                                      y="9"
                                      width="13"
                                      height="13"
                                      rx="2"
                                    />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleDownload(thumb)}
                                disabled={!!downloading}
                                className="p-2 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all disabled:opacity-50"
                                title="Download"
                              >
                                {downloading === thumb.key ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <DownloadIcon className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      {/* <CreatorFooter /> */}
    </div>
  );
}
