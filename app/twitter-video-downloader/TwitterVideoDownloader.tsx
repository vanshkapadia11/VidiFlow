"use client";
import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

interface TwitterFormat {
  url: string;
  quality: string;
  label?: string;
}

interface TwitterResult {
  title?: string;
  author?: string;
  thumbnail?: string;
  formats: TwitterFormat[];
}

export default function TwitterDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TwitterResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/twitter", {
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

  const handleDownload = async (fmt: TwitterFormat) => {
    if (downloading) return;
    setDownloading(fmt.quality);
    const safeFilename =
      (result?.title || "xvideo")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "XSave";
    try {
      const proxyUrl = `/api/twitter-proxy?url=${encodeURIComponent(fmt.url)}&filename=${encodeURIComponent(safeFilename)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        const link = document.createElement("a");
        link.href = fmt.url;
        link.download = `${safeFilename}.mp4`;
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
      link.download = `${safeFilename}.mp4`;
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

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-zinc-900 text-white border-none text-[10px] font-bold uppercase rounded-full px-3">
                X Tool v1.0
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-zinc-900 animate-pulse" />{" "}
                All Qualities
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              XRip<span className="text-zinc-500">.</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Output
              </p>
              <p className="text-sm font-bold text-zinc-600">MP4 · HD · GIF</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-900 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-sm">𝕏</span>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Twitter / X Downloader
                  </span>
                </div>
                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Tweet / X Post URL
                    </label>
                    <Input
                      placeholder="https://x.com/user/status/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-zinc-400/30 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-zinc-200"
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

            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              {[
                ["🎬", "Videos", "All qualities"],
                ["🎞️", "GIFs", "As MP4 file"],
                ["📱", "Twitter & X", "Both domains work"],
              ].map(([icon, label, desc]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="text-white text-[11px] font-bold leading-none">
                      {label}
                    </p>
                    <p className="text-zinc-500 text-[10px]">{desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  ⚠️ Only <span className="text-white font-bold">public</span>{" "}
                  tweets. Protected accounts cannot be accessed.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-100 flex items-center justify-center rotate-6 border border-zinc-200">
                      <span className="text-zinc-300 font-black text-5xl">
                        𝕏
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                      <DownloadIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting X Post URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste any public Twitter or X post link containing a video
                      or GIF.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {result.thumbnail && (
                      <div className="relative group shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-zinc-400 to-zinc-200 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <img
                          src={result.thumbnail}
                          alt="thumbnail"
                          className="relative w-44 h-44 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                        />
                        <div className="absolute inset-0 rounded-[20px] flex items-center justify-center bg-black/10">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5 fill-zinc-900 ml-1"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 space-y-5">
                      <div className="space-y-2">
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                          ✓ Video Found
                        </Badge>
                        {result.title &&
                          result.title !== "X / Twitter Video" && (
                            <p className="text-sm font-bold text-zinc-700 line-clamp-3 leading-relaxed">
                              {result.title}
                            </p>
                          )}
                        {result.author && (
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            @{result.author}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Available Qualities
                        </p>
                        <div className="space-y-2">
                          {result.formats.map((fmt, i) => (
                            <Button
                              key={i}
                              onClick={() => handleDownload(fmt)}
                              disabled={!!downloading}
                              className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                                i === 0
                                  ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200"
                                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                              }`}
                            >
                              {downloading === fmt.quality ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <>
                                  <DownloadIcon className="h-3.5 w-3.5" />{" "}
                                  {fmt.label || fmt.quality}{" "}
                                  {i === 0 ? "— Best" : ""}
                                </>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>

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
              )}
            </Card>
          </div>
        </div>
      </main>
      {/* <CreatorFooter /> */}
    </div>
  );
}
