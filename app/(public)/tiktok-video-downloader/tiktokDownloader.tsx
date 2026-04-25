"use client";

import * as React from "react";
import { useState } from "react";
import {
  DownloadIcon,
  Loader2,
  RefreshCcw,
  VideoIcon,
  CheckCircle2,
  AlertCircle,
  PlayCircleIcon,
  ZapIcon,
  Trash2Icon,
  Link2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

interface TikTokResult {
  videoUrl: string;
  videoUrlHD?: string;
  videoUrlSD?: string;
  videoUrlWatermark?: string;
  thumbnail: string;
  title: string;
  author: string;
  duration: number;
}

export default function TikTokDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<TikTokResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState("hd");

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Error ${res.status}`);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result || downloading) return;
    setDownloading(true);
    try {
      let videoUrl = result.videoUrl;
      if (quality === "high hd" && result.videoUrlHD)
        videoUrl = result.videoUrlHD;
      if (quality === "hd" && result.videoUrlSD) videoUrl = result.videoUrlSD;
      if (quality === "watermark" && result.videoUrlWatermark)
        videoUrl = result.videoUrlWatermark;

      const proxyUrl = `/api/tiktok-proxy?url=${encodeURIComponent(videoUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `TikSave-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Download failed: " + (err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-zinc-900">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                  </svg>
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  TikSave v4.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                No Watermark · HD
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Tik
              <span className="relative inline-block">
                <span className="text-red-600">Save.</span>
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
              Download any public TikTok video without watermarks — HD quality,
              instant, no login needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "HD", label: "Quality" },
              { value: "MP4", label: "Format" },
              { value: "0", label: "Watermarks" },
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
          {/* ── LEFT ── */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* Brand icon row */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                    </svg>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    TikTok Downloader
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> TikTok URL
                    </label>
                    <button
                      onClick={reset}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <form onSubmit={handleFetch} className="space-y-4">
                    <Input
                      placeholder="https://tiktok.com/@user/video/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-red-500/20 focus-visible:border-red-500/50 transition-all"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !url}
                      className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <span className="flex items-center gap-2">
                          <DownloadIcon className="h-3.5 w-3.5" /> Fetch Video
                        </span>
                      )}
                    </Button>
                  </form>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dark info panel */}
            <div className="p-5 bg-zinc-900 rounded-[24px] text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-red-400">
                <ZapIcon className="h-3.5 w-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Features
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: "🎬",
                    label: "No Watermark",
                    desc: "Clean HD download",
                  },
                  {
                    icon: "⚡",
                    label: "Multi Quality",
                    desc: "HD, High HD, Original",
                  },
                  {
                    icon: "🎵",
                    label: "Audio Extract",
                    desc: "MP3 from any video",
                  },
                  {
                    icon: "🔗",
                    label: "Short Links",
                    desc: "vm.tiktok.com supported",
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
                  ⚠️ Only <span className="text-red-400 font-bold">public</span>{" "}
                  TikTok videos can be downloaded.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col transition-all">
              {/* EMPTY STATE */}
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-50 flex items-center justify-center rotate-3 border border-zinc-100">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-12 h-12 fill-zinc-200"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                      <DownloadIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting TikTok URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste any public TikTok video link to download without
                      watermark.
                    </p>
                  </div>
                </div>
              ) : (
                /* RESULT STATE */
                <div className="p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    {/* Thumbnail */}
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-2 bg-zinc-900/10 rounded-[28px] blur-md" />
                      <img
                        src={result.thumbnail}
                        className="relative w-48 h-80 object-cover rounded-[24px] shadow-2xl border-4 border-white"
                        alt="TikTok thumbnail"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[24px] bg-black/20">
                        <PlayCircleIcon className="text-white h-14 w-14 drop-shadow-lg" />
                      </div>
                    </div>

                    {/* Info + buttons */}
                    <div className="flex-1 space-y-6 text-center md:text-left py-2">
                      <div className="space-y-3">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase font-black px-3 py-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready to download
                        </Badge>

                        <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tight line-clamp-2 leading-tight">
                          {result.title || "TikTok Video"}
                        </h3>

                        <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
                          @{result.author}
                          {result.duration
                            ? ` · ${formatDuration(result.duration)}`
                            : ""}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100 text-center">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                              Format
                            </p>
                            <p className="text-sm font-black text-zinc-800 uppercase italic mt-0.5">
                              MP4
                            </p>
                          </div>
                          <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100 text-center">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                              Quality
                            </p>
                            <p className="text-sm font-black text-green-600 uppercase italic mt-0.5">
                              HD
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quality selector */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center md:text-left">
                          Select Quality
                        </p>
                        <div className="flex p-1 bg-zinc-50 rounded-2xl border border-zinc-100">
                          {["hd", "high hd", "watermark"].map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuality(q)}
                              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                quality === q
                                  ? "bg-white shadow-sm text-zinc-900 border border-zinc-100"
                                  : "text-zinc-400 hover:text-zinc-600"
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Download button */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full h-16 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[20px] font-black uppercase text-sm shadow-xl transition-transform active:scale-95"
                        >
                          {downloading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            <span className="flex items-center gap-2">
                              <DownloadIcon className="h-4 w-4" /> Download
                              Video
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={reset}
                          className="w-full text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px]"
                        >
                          <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Start
                          Fresh
                        </Button>
                      </div>
                    </div>
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
