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
  MusicIcon,
  UserIcon,
  HeadphonesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

// ── Types ──────────────────────────────────────────────────────────────────

interface AudioResult {
  videoId: string;
  audioUrl: string;
  format: string;
  bitrate?: string;
  title?: string;
  author?: string;
  thumbnail?: string;
  success: boolean;
  error?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function YouTubeAudioDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [result, setResult] = React.useState<AudioResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Fetch audio info ────────────────────────────────────────────────────
  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/youtube-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data: AudioResult = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Server error (${res.status})`);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ── Download via proxy ──────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!result?.audioUrl || downloading || !isMounted) return;
    setDownloading(true);

    const safeTitle =
      (result.title || "audio")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "AudioRip";

    const ext =
      result.format === "webm"
        ? "webm"
        : result.format === "m4a"
          ? "m4a"
          : "mp3";

    const directDownload = (fileUrl: string) => {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `${safeTitle}.${ext}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    try {
      const proxyUrl = `/api/youtube-audio-proxy?url=${encodeURIComponent(result.audioUrl)}&filename=${encodeURIComponent(safeTitle)}`;
      const res = await fetch(proxyUrl);

      const proxyAction = res.headers.get("X-Proxy-Action");
      if (proxyAction === "direct-download") {
        directDownload(res.headers.get("X-Direct-URL") || result.audioUrl);
        return;
      }

      if (!res.ok) {
        directDownload(result.audioUrl);
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        directDownload(json.redirect || result.audioUrl);
        return;
      }

      const blob = await res.blob();
      if (blob.size < 1000) {
        directDownload(result.audioUrl);
        return;
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${safeTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      directDownload(result.audioUrl);
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

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-red-50 text-red-600 border-none text-[10px] font-bold uppercase rounded-full px-3">
                AudioRip Pro
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                MP3 · Up to 320kbps
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 italic uppercase">
              AudioRip<span className="text-red-600">.</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Output
              </p>
              <p className="text-sm font-bold text-zinc-600">
                MP3 · High Quality
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                    <MusicIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    YouTube → MP3
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
                        <MusicIcon className="h-3.5 w-3.5" /> Extract Audio
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

            {/* Dark panel */}
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
                    icon: "🎵",
                    label: "MP3 Output",
                    desc: "Up to 320kbps quality",
                  },
                  {
                    icon: "📱",
                    label: "Shorts Support",
                    desc: "Works with Shorts too",
                  },
                  {
                    icon: "🔗",
                    label: "Short URLs",
                    desc: "youtu.be links work",
                  },
                  {
                    icon: "⚡",
                    label: "Fast Extraction",
                    desc: "8 strategies tried",
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
                  videos. Personal use only.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col">
              {/* EMPTY STATE */}
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center -rotate-6 border border-red-100">
                      <HeadphonesIcon className="h-12 w-12 text-red-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <MusicIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting YouTube URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste any public YouTube link to extract audio as MP3.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center pt-2">
                    {["320kbps", "256kbps", "192kbps", "128kbps"].map((b) => (
                      <span
                        key={b}
                        className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase bg-red-50 text-red-600"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* RESULT STATE */
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  {/* Thumbnail + meta */}
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-red-500 to-red-300 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                      {result.thumbnail ? (
                        <div className="relative">
                          <img
                            src={result.thumbnail}
                            alt="thumbnail"
                            className="relative w-48 h-28 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://i.ytimg.com/vi/${result.videoId}/hqdefault.jpg`;
                            }}
                          />
                          {/* Animated music bars overlay */}
                          <div className="absolute inset-0 rounded-[20px] bg-black/40 flex items-center justify-center">
                            <div className="flex items-end gap-[3px] h-8">
                              {[3, 6, 9, 7, 5, 8, 6, 4, 7, 5].map((h, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-white rounded-full"
                                  style={{
                                    height: `${h * 3}px`,
                                    opacity: 0.85,
                                    animation: `audioBar ${0.5 + i * 0.08}s ease-in-out infinite alternate`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <style>{`
                            @keyframes audioBar {
                              from { transform: scaleY(0.3); }
                              to { transform: scaleY(1); }
                            }
                          `}</style>
                        </div>
                      ) : (
                        <div className="w-48 h-28 rounded-[20px] bg-red-50 border-4 border-white shadow-2xl flex items-center justify-center">
                          <MusicIcon className="h-12 w-12 text-red-200" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase font-black px-3 py-1">
                          <CheckCircle2Icon className="h-3 w-3 mr-1" /> Ready
                        </Badge>
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg uppercase bg-red-50 text-red-600">
                          🎵 {result.format?.toUpperCase() || "MP3"}
                        </span>
                        {result.bitrate ? (
                          <span className="text-[9px] font-black px-2 py-1 rounded-lg uppercase bg-zinc-100 text-zinc-500">
                            {result.bitrate}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-lg font-black text-zinc-900 uppercase italic leading-tight line-clamp-2">
                        {result.title || "YouTube Audio"}
                      </h3>
                      {result.author ? (
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <UserIcon className="h-3 w-3" /> {result.author}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Format",
                        value: result.format?.toUpperCase() || "MP3",
                      },
                      { label: "Quality", value: result.bitrate || "High" },
                      { label: "Type", value: "Audio Only" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-center"
                      >
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm font-black text-zinc-800 uppercase italic">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Download + reset */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-[20px] font-black uppercase text-sm shadow-xl shadow-red-100 transition-transform active:scale-95"
                    >
                      {downloading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin h-5 w-5" />{" "}
                          Downloading...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <DownloadIcon className="h-5 w-5" />
                          Download {result.format?.toUpperCase() || "MP3"}
                          {result.bitrate ? ` · ${result.bitrate}` : ""}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={reset}
                      className="w-full text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px]"
                    >
                      <RotateCcwIcon className="mr-2 h-3.5 w-3.5" /> Download
                      Another
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
