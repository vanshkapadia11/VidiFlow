"use client";

import * as React from "react";
import {
  InstagramIcon,
  DownloadIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircleIcon,
  LinkIcon,
  SearchIcon,
  ClockIcon,
  UserIcon,
  FilmIcon,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";

interface MediaInfo {
  type: "video" | "image";
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  defaultUrl: string;
  formats: { quality: string; url: string }[];
}

type Status =
  | "idle"
  | "fetching"
  | "ready"
  | "downloading"
  | "success"
  | "error";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isValidInstagramUrl(val: string): boolean {
  return /instagram\.com\/(p|reel|reels|tv|stories)\/[A-Za-z0-9_-]+/.test(val);
}

export default function InstaRipDownloader() {
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [mediaInfo, setMediaInfo] = React.useState<MediaInfo | null>(null);

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidInstagramUrl(url)) {
      setErrorMsg("Please enter a valid Instagram URL (post, reel, or IGTV).");
      setStatus("error");
      return;
    }
    setStatus("fetching");
    setErrorMsg("");
    setMediaInfo(null);
    try {
      const res = await fetch("/api/instagram-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Failed to fetch media info");
      setMediaInfo({
        type: data.type || "video",
        title: data.title || "Instagram Post",
        author: data.author || "",
        duration: data.duration || 0,
        thumbnail: data.thumbnail || "",
        defaultUrl: data.defaultUrl || "",
        formats: data.formats || [],
      });
      setStatus("ready");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!url.trim() || !mediaInfo) return;
    setStatus("downloading");
    setErrorMsg("");
    try {
      const endpoint =
        mediaInfo.type === "image"
          ? "/api/instagram-image"
          : "/api/instagram-video";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const ext = mediaInfo.type === "image" ? "jpg" : "mp4";
      const filename = match
        ? match[1].replace(/['"]/g, "")
        : `InstaRip-${Date.now()}.${ext}`;

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
    setMediaInfo(null);
  };

  const igGradient =
    "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";
  const igShadow = "0 6px 24px rgba(225,48,108,0.35)";

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className="border-none text-[10px] font-bold uppercase rounded-full px-3"
                style={{ background: igGradient, color: "white" }}
              >
                Free Tool
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div
                  className="h-1 w-1 rounded-full animate-pulse"
                  style={{ background: "#e1306c" }}
                />
                Live
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              InstaRip<span style={{ color: "#e1306c" }}>.</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Instagram Reels, posts &amp; IGTV. Paste, click, download.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT ── */}
          <div className="lg:col-span-4 space-y-5">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-50 p-2 rounded-lg">
                    <InstagramIcon className="h-4 w-4 text-pink-500" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Instagram Downloader
                  </span>
                </div>

                <form onSubmit={handleFetchInfo} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      Instagram URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                      <Input
                        type="url"
                        placeholder="https://instagram.com/reel/..."
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (status === "error") setStatus("idle");
                          if (status === "ready" || status === "success") {
                            setMediaInfo(null);
                            setStatus("idle");
                          }
                        }}
                        className="h-12 pl-10 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-pink-500/20 focus-visible:border-pink-400/50 transition-all"
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
                      className="w-full h-12 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg disabled:opacity-40"
                      style={{ background: igGradient, boxShadow: igShadow }}
                    >
                      <span className="flex items-center gap-2">
                        <SearchIcon className="h-3.5 w-3.5" />
                        Fetch Media Info
                      </span>
                    </Button>
                  )}

                  {status === "fetching" && (
                    <Button
                      disabled
                      className="w-full h-12 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest opacity-60"
                      style={{ background: igGradient }}
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
                    Works with Reels, posts, carousels &amp; IGTV
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="p-5 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div
                className="flex items-center gap-2"
                style={{ color: "#e1306c" }}
              >
                <InstagramIcon className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  How it works
                </span>
              </div>
              <div className="space-y-2.5 text-zinc-300 text-[11px] leading-relaxed">
                <div className="flex gap-2.5">
                  <span className="font-black" style={{ color: "#e1306c" }}>
                    1.
                  </span>
                  <span>Paste any public Instagram post or Reel URL.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="font-black" style={{ color: "#e1306c" }}>
                    2.
                  </span>
                  <span>Hit Fetch Info — preview the media details.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="font-black" style={{ color: "#e1306c" }}>
                    3.
                  </span>
                  <span>Click Download on the right panel.</span>
                </div>
                <p className="text-zinc-500 pt-1 text-[10px]">
                  Only works on public accounts. Private posts cannot be
                  downloaded.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col">
              {/* IDLE — no media yet */}
              {!mediaInfo && status !== "fetching" && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full opacity-20 scale-150 animate-ping"
                      style={{
                        background: `radial-gradient(circle, #f09433, #bc1888)`,
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full opacity-30 scale-125 animate-pulse"
                      style={{
                        background: `radial-gradient(circle, #f09433, #bc1888)`,
                      }}
                    />
                    <div
                      className="relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 border-4 border-white"
                      style={{
                        background: igGradient,
                        boxShadow: "0 20px 60px rgba(225,48,108,0.35)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                        <DownloadIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-sm">
                    <h2 className="text-3xl font-black uppercase italic text-zinc-900 leading-tight">
                      Instagram
                      <br />
                      <span
                        style={{
                          background: igGradient,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Downloader
                      </span>
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Paste an Instagram URL on the left and hit{" "}
                      <span className="text-zinc-600 font-semibold">
                        Fetch Info
                      </span>{" "}
                      — the preview and download button will appear here.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    {["Reels", "Posts", "IGTV", "No Watermark", "Free"].map(
                      (tag) => (
                        <div
                          key={tag}
                          className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black uppercase text-zinc-500 tracking-wider"
                        >
                          {tag}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* FETCHING */}
              {status === "fetching" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center">
                    <Loader2Icon className="h-8 w-8 text-pink-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-700 text-sm font-bold">
                      Fetching media details…
                    </p>
                    <p className="text-zinc-400 text-xs">
                      This usually takes a few seconds.
                    </p>
                  </div>
                </div>
              )}

              {/* MEDIA READY */}
              {mediaInfo &&
                (status === "ready" ||
                  status === "downloading" ||
                  status === "success") && (
                  <div className="flex-1 flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-zinc-100 shrink-0">
                      {mediaInfo.thumbnail ? (
                        <img
                          src={mediaInfo.thumbnail}
                          alt={mediaInfo.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: igGradient }}
                        >
                          <InstagramIcon className="h-16 w-16 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Type badge */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span
                          className="text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5"
                          style={{ background: igGradient }}
                        >
                          {mediaInfo.type === "image" ? (
                            <>
                              <ImageIcon className="h-3 w-3" /> Photo
                            </>
                          ) : (
                            <>
                              <FilmIcon className="h-3 w-3" /> Video
                            </>
                          )}
                        </span>
                      </div>

                      {/* Duration */}
                      {mediaInfo.duration > 0 && (
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          {formatDuration(mediaInfo.duration)}
                        </div>
                      )}
                    </div>

                    {/* Info + download */}
                    <div className="flex-1 p-7 flex flex-col gap-5">
                      <div className="space-y-2.5">
                        <h2 className="text-xl font-black text-zinc-900 leading-snug line-clamp-2">
                          {mediaInfo.title}
                        </h2>
                        <div className="flex items-center gap-4 text-zinc-400 text-sm flex-wrap">
                          {mediaInfo.author && (
                            <span className="flex items-center gap-1.5">
                              <UserIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                @{mediaInfo.author}
                              </span>
                            </span>
                          )}
                          {mediaInfo.duration > 0 && (
                            <span className="flex items-center gap-1.5">
                              <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                              <span>{formatDuration(mediaInfo.duration)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pills */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full"
                          style={{ background: igGradient }}
                        >
                          {mediaInfo.type === "image" ? "JPG" : "MP4"}
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                          HD Quality
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                          No Watermark
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                          Free
                        </span>
                      </div>

                      <div className="flex-1" />

                      {/* Status alerts */}
                      {status === "success" && (
                        <div className="flex items-center gap-2 p-3.5 bg-green-50 rounded-xl border border-green-100">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                          <p className="text-xs text-green-700 font-medium">
                            Downloaded successfully!
                          </p>
                        </div>
                      )}

                      {status === "downloading" && (
                        <div className="flex items-center gap-2 p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                          <Loader2Icon className="h-4 w-4 text-amber-500 animate-spin shrink-0" />
                          <p className="text-xs text-amber-700 font-medium">
                            Downloading on server… do not close this tab.
                          </p>
                        </div>
                      )}

                      {/* Download button */}
                      {status === "ready" && (
                        <Button
                          onClick={handleDownload}
                          className="w-full h-13 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all py-4"
                          style={{
                            background: igGradient,
                            boxShadow: igShadow,
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" />
                            Download{" "}
                            {mediaInfo.type === "image" ? "Photo" : "Video"}
                          </span>
                        </Button>
                      )}

                      {status === "downloading" && (
                        <Button
                          disabled
                          className="w-full py-4 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest opacity-60"
                          style={{ background: igGradient }}
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
                          className="w-full py-4 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all"
                          style={{
                            background: igGradient,
                            boxShadow: igShadow,
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" />
                            Download Again
                          </span>
                        </Button>
                      )}

                      <button
                        onClick={handleReset}
                        className="w-full text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors font-medium tracking-widest uppercase"
                      >
                        ← Try another URL
                      </button>
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
