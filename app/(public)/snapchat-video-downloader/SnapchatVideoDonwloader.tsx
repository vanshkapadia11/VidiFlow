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

interface SnapResult {
  videoUrl: string;
  thumbnail?: string;
  title?: string;
}

export default function SnapchatDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [result, setResult] = React.useState<SnapResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isValidSnapLink = (link: string) => {
    if (!link) return false;
    return link.includes("snapchat.com") || link.includes("t.snapchat.com");
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!isValidSnapLink(url)) {
      setError("Please enter a valid Snapchat URL");
      return;
    }

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
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.videoUrl || downloading || !isMounted) return;
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
        const link = document.createElement("a");
        link.href = result.videoUrl;
        link.download = `${safeFilename}.mp4`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const blob = await res.blob();
      if (blob.size < 1000) throw new Error("Downloaded file is too small");

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeFilename}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      setError(
        "Download failed: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-yellow-100 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400">
                  <GhostIcon className="h-2.5 w-2.5 text-zinc-900" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  SnapRip Pro
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" />
                Spotlight &amp; Stories
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Snap
              <span className="relative inline-block">
                <span className="text-yellow-400">Rip.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#facc15"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Download Snapchat Spotlight and Stories in high quality — fast,
              free, no login needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "HD", label: "Quality" },
              { value: "MP4", label: "Format" },
              { value: "Snap", label: "Platform" },
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
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <GhostIcon className="h-4 w-4 text-zinc-900" />
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
                      placeholder="Paste link here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-yellow-400/30 focus-visible:border-yellow-400 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg"
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

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-5 bg-zinc-900 rounded-[24px] text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-yellow-400">
                <ZapIcon className="h-3.5 w-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              <div className="space-y-3 text-zinc-400 text-[10px] font-mono">
                <p>
                  <span className="text-white font-sans font-bold block mb-1">
                    Spotlight
                  </span>
                  snapchat.com/spotlight/...
                </p>
                <p>
                  <span className="text-white font-sans font-bold block mb-1">
                    Stories
                  </span>
                  story.snapchat.com/s/...
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col transition-all">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-yellow-50 flex items-center justify-center rotate-3 border border-yellow-100">
                      <GhostIcon className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm italic">
                    Paste a public link to start.
                  </p>
                </div>
              ) : (
                <div className="p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-2 bg-yellow-400/20 rounded-[28px] blur-md" />
                      {result.thumbnail ? (
                        <img
                          src={result.thumbnail}
                          alt="Preview"
                          className="relative w-48 h-80 object-cover rounded-[24px] shadow-2xl border-4 border-white"
                        />
                      ) : (
                        <div className="w-48 h-80 rounded-[24px] bg-zinc-100 flex items-center justify-center border-4 border-white shadow-2xl">
                          <GhostIcon className="h-20 w-20 text-zinc-200" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left py-2">
                      <div className="space-y-3">
                        <Badge className="bg-green-100 text-green-700 uppercase font-black px-3 py-1">
                          Ready to download
                        </Badge>
                        <h3 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tight">
                          {result.title || "Snapchat Video"}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100 text-center">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            Type
                          </p>
                          <p className="text-sm font-black text-zinc-800 uppercase italic">
                            MP4
                          </p>
                        </div>
                        <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100 text-center">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            Quality
                          </p>
                          <p className="text-sm font-black text-green-600 uppercase italic">
                            HD
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <Button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full h-16 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-[20px] font-black uppercase text-sm shadow-xl shadow-yellow-100 transition-transform active:scale-95"
                        >
                          {downloading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            "Download Video"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={reset}
                          className="w-full text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px]"
                        >
                          <RotateCcwIcon className="mr-2 h-3.5 w-3.5" /> Start
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
