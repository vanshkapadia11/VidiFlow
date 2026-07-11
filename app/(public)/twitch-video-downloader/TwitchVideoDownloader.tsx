"use client";
import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  TvIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

interface TwitchFormat {
  url: string;
  quality: string;
  label?: string;
  isM3u8?: boolean;
}

interface TwitchResult {
  title?: string;
  thumbnail?: string;
  broadcaster?: string;
  game?: string;
  duration: number;
  views: number;
  type: "clip" | "vod";
  isM3u8?: boolean;
  formats: TwitchFormat[];
}

export default function TwitchDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TwitchResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/twitch", {
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

  const handleDownload = async (fmt: TwitchFormat) => {
    if (downloading) return;
    setDownloading(fmt.quality);
    const safeFilename =
      (result?.title || "twitch")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "TwitchSave";
    try {
      if (fmt.isM3u8) {
        window.open(fmt.url, "_blank");
        return;
      }
      const proxyUrl = `/api/twitch-proxy?url=${encodeURIComponent(fmt.url)}&filename=${encodeURIComponent(safeFilename)}`;
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
      if (blob.size < 1000) throw new Error("File too small");
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

  const formatDuration = (s: number) => {
    if (!s) return "";
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = s % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
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
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600">
                  <TvIcon className="h-2.5 w-2.5 text-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Twitch Tool v1.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-purple-500 animate-pulse" />
                Clips &amp; VODs
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Twitch
              <span className="relative inline-block">
                <span className="text-purple-600">Rip.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 120 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q30 2 60 4 Q90 6 118 2"
                    stroke="#9333ea"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Download Twitch clips and VODs in full quality — MP4 direct
              downloads, no login needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "MP4", label: "Format" },
              { value: "HD", label: "Quality" },
              { value: "VOD", label: "Supported" },
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
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <TvIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Twitch Downloader
                  </span>
                </div>
                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Twitch Clip or VOD URL
                    </label>
                    <Input
                      placeholder="https://twitch.tv/videos/... or clips.twitch.tv/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-purple-500/20 focus-visible:border-purple-400/50 transition-all"
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
              <div className="flex items-center gap-2 text-purple-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              {[
                ["🎬", "Twitch Clips", "clips.twitch.tv/..."],
                ["📺", "VODs", "twitch.tv/videos/..."],
                ["🎮", "Highlight Clips", "Channel clip links"],
              ].map(([icon, label, desc]) => (
                <div key={label} className="flex items-center gap-3">
                  <span>{icon}</span>
                  <div>
                    <p className="text-white text-[11px] font-bold leading-none">
                      {label}
                    </p>
                    <p className="text-zinc-500 text-[10px] font-mono">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  ⚠️ VODs use HLS streaming — opens in a new tab for playback.
                  Clips download as MP4 directly.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-purple-50 flex items-center justify-center rotate-6 border border-purple-100">
                      <TvIcon className="h-10 w-10 text-purple-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <DownloadIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Twitch URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste a Twitch clip or VOD link to download.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group shrink-0">
                      {result.thumbnail ? (
                        <>
                          <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-purple-300 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                          <img
                            src={result.thumbnail}
                            alt="thumbnail"
                            className="relative w-48 h-28 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
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
                        <div className="w-48 h-28 rounded-[20px] bg-purple-50 border-4 border-white shadow-2xl flex items-center justify-center">
                          <TvIcon className="h-10 w-10 text-purple-200" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-5">
                      <div className="space-y-2">
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                          ✓ {result.type === "clip" ? "Clip" : "VOD"} Found
                        </Badge>
                        <h3 className="text-xl font-black text-zinc-900 uppercase italic leading-tight line-clamp-2">
                          {result.title || "Twitch Video"}
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                          {result.broadcaster && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-600 uppercase">
                              📺 {result.broadcaster}
                            </span>
                          )}
                          {result.game && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500 uppercase">
                              🎮 {result.game}
                            </span>
                          )}
                          {result.duration > 0 && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500">
                              ⏱ {formatDuration(result.duration)}
                            </span>
                          )}
                          {result.views > 0 && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-400">
                              👁 {result.views.toLocaleString()} views
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          {result.isM3u8
                            ? "Quality (opens in browser)"
                            : "Select Quality"}
                        </p>
                        <div className="space-y-2">
                          {result.formats.map((fmt, i) => (
                            <Button
                              key={i}
                              onClick={() => handleDownload(fmt)}
                              disabled={!!downloading}
                              className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                                i === 0
                                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100"
                                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                              }`}
                            >
                              {downloading === fmt.quality ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <>
                                  <DownloadIcon className="h-3.5 w-3.5" />
                                  {fmt.label || fmt.quality}
                                  {fmt.isM3u8 && (
                                    <span className="text-[9px] opacity-60 ml-1">
                                      (HLS)
                                    </span>
                                  )}
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
