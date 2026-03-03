"use client";

import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  GhostIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

export default function SnapchatDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/snapchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Server error (${res.status})`);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.videoUrl || downloading) return;
    setDownloading(true);

    const safeFilename =
      (result.title || "snap")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "SnapSave";

    try {
      const proxyUrl = `/api/snapchat-proxy?url=${encodeURIComponent(result.videoUrl)}&filename=${encodeURIComponent(safeFilename)}`;
      const res = await fetch(proxyUrl);

      if (!res.ok) {
        // Fallback: direct link
        const link = document.createElement("a");
        link.href = result.videoUrl;
        link.download = `${safeFilename}.mp4`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const blob = await res.blob();
      if (blob.size < 1000) throw new Error("Downloaded file too small");

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeFilename}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      setError("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-yellow-50 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-yellow-50 text-yellow-600 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Snapchat Tool v1.0
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" />
                Spotlight & Stories
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              SnapRip<span className="text-yellow-400">.</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Output
              </p>
              <p className="text-sm font-bold text-zinc-600">
                MP4 · HD Quality
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: INPUT */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-50 p-2 rounded-lg">
                    <GhostIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Snap Downloader
                  </span>
                </div>

                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Snapchat URL
                    </label>
                    <Input
                      placeholder="https://www.snapchat.com/spotlight/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-yellow-400/30 focus-visible:border-yellow-400/50 transition-all"
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
                        <DownloadIcon className="h-3.5 w-3.5" /> Get Video
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

            {/* Info panel */}
            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Links
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Spotlight Videos",
                    example: "snapchat.com/spotlight/...",
                  },
                  {
                    label: "Public Stories",
                    example: "story.snapchat.com/s/...",
                  },
                  { label: "Short Links", example: "t.snapchat.com/..." },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-white text-[11px] font-bold">
                      {item.label}
                    </p>
                    <p className="text-zinc-500 text-[10px] font-mono truncate">
                      {item.example}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  ⚠️ Only{" "}
                  <span className="text-yellow-400 font-bold">public</span>{" "}
                  Snaps can be downloaded. Private or friend-only content is not
                  accessible.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULT */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  {/* Snapchat ghost icon */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-yellow-50 flex items-center justify-center rotate-6 border border-yellow-100">
                      <GhostIcon className="h-10 w-10 text-yellow-300" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <DownloadIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Snap Link
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste a Snapchat Spotlight or public story link to
                      download the video.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  {/* Video preview + info */}
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Thumbnail / video preview */}
                    <div className="relative group shrink-0">
                      {result.thumbnail ? (
                        <>
                          <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-[24px] blur opacity-30 group-hover:opacity-50 transition duration-500" />
                          <img
                            src={result.thumbnail}
                            alt="Snap thumbnail"
                            className="relative w-44 h-72 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          {/* Play overlay */}
                          <div className="absolute inset-0 rounded-[20px] flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5 fill-zinc-900 ml-1"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-44 h-72 rounded-[20px] bg-zinc-100 border-4 border-white shadow-2xl flex items-center justify-center">
                          <GhostIcon className="h-16 w-16 text-zinc-200" />
                        </div>
                      )}
                    </div>

                    {/* Info + download */}
                    <div className="flex-1 space-y-6 text-center md:text-left">
                      <div className="space-y-2">
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                          ✓ Video Found
                        </Badge>
                        <h3 className="text-2xl font-black text-zinc-900 uppercase italic leading-tight">
                          {result.title || "Snapchat Video"}
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600 uppercase">
                            🎬 MP4
                          </span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500 uppercase">
                            HD Quality
                          </span>
                          {result.source && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-400 uppercase">
                              via {result.source}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">
                            Format
                          </p>
                          <p className="text-xs font-bold text-zinc-700">
                            MP4 Video
                          </p>
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">
                            Status
                          </p>
                          <p className="text-xs font-bold text-green-600">
                            Ready
                          </p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-3 pt-2">
                        <Button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-100"
                        >
                          {downloading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <DownloadIcon className="h-4 w-4" />
                              Download Video
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={reset}
                          className="w-full text-zinc-400 hover:text-zinc-700 font-bold uppercase text-[10px] tracking-tighter"
                        >
                          <RotateCcwIcon className="mr-2 h-3 w-3" /> Download
                          Another
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
      <CreatorFooter />
    </div>
  );
}
