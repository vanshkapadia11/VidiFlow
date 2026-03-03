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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

export default function TikTokDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quality, setQuality] = useState("hd");

  const handleFetch = async (e) => {
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
      setError(err.message);
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
      setError("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-sm text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-zinc-100 text-zinc-500 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Stable v4.0
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500" /> Media
                Proxy Online
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              TikSave<span className="text-red-600">.</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5">Format</p>
              <p className="text-sm font-bold text-zinc-600 tracking-tight">
                MP4 / No-WM
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5">Speed</p>
              <p className="text-sm font-bold text-zinc-600 tracking-tight">
                Optimized
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: INPUT CONSOLE */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      TikTok URL
                    </label>
                    <button
                      onClick={() => {
                        setUrl("");
                        setResult(null);
                        setError(null);
                      }}
                      className="text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <form onSubmit={handleFetch} className="space-y-4">
                    <Input
                      placeholder="Paste link (e.g. tiktok.com/@user/video/...)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-white font-medium focus:ring-0 focus:border-red-500/50"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !url}
                      className="w-full h-12 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-none border-none"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Fetch Metadata"
                      )}
                    </Button>
                  </form>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <ZapIcon className="h-3 w-3 text-red-500 fill-red-500" />{" "}
                Features
              </p>
              <div className="flex flex-wrap gap-2">
                {["No Watermark", "HD Quality", "Fast Proxy", "MP3 Export"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="bg-white border border-zinc-200 text-zinc-500 text-[10px] font-bold py-1 px-3 rounded-full uppercase"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: PREVIEW & DOWNLOAD */}
          <div className="lg:col-span-7">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-2xl overflow-hidden bg-white min-h-[400px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                    <VideoIcon className="h-6 w-6 text-zinc-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Awaiting Input
                    </p>
                    <p className="text-zinc-500 max-w-[240px]">
                      Enter a TikTok URL to begin the architectural extraction.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="relative group flex-shrink-0">
                      <img
                        src={result.thumbnail}
                        className="w-32 h-44 object-cover rounded-xl shadow-lg shadow-zinc-200"
                        alt="Video Cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                        <PlayCircleIcon className="text-white h-8 w-8" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none text-[9px] uppercase px-2 py-0">
                          Ready
                        </Badge>
                        <h3 className="text-lg font-bold leading-tight text-zinc-900 line-clamp-2">
                          {result.title || "TikTok Video"}
                        </h3>
                        <p className="text-zinc-400 font-medium">
                          @{result.author}
                        </p>
                      </div>

                      <div className="flex gap-4 border-t border-zinc-100 pt-4">
                        <div>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">
                            Duration
                          </p>
                          <p className="text-xs font-bold text-zinc-700">
                            {formatDuration(result.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">
                            Status
                          </p>
                          <p className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />{" "}
                            Scanned
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                      {["hd", "high hd", "watermark"].map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${quality === q ? "bg-white shadow-sm text-red-600" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.15em] transition-all flex items-center justify-center gap-3"
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          Processing Stream...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4" />
                          Download Final Asset
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <CreatorFooter />
    </div>
  );
}
