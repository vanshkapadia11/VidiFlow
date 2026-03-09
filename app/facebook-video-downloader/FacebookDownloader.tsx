"use client";

import * as React from "react";
import { FormEvent } from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  ImageIcon,
  VideoIcon,
  MonitorPlayIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

export default function FacebookDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFetch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Server error (${res.status})`);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileUrl: string, label: string) => {
    if (!fileUrl || downloading) return;
    setDownloading(label);

    const safeFilename =
      (result.title || "facebook")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "FBSave";

    try {
      const proxyUrl = `/api/facebook-proxy?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(safeFilename)}&type=${result.type}`;
      const res = await fetch(proxyUrl);

      if (!res.ok) {
        // Proxy failed — open directly
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = `${safeFilename}.${result.type === "image" ? "jpg" : "mp4"}`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const blob = await res.blob();
      if (blob.size < 1000)
        throw new Error("File too small — try opening directly");

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeFilename}.${result.type === "image" ? "jpg" : "mp4"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err: any) {
      // Last resort — open in new tab so user can manually save
      window.open(fileUrl, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
    setDownloading(null);
  };

  // Build download buttons from whatever URLs exist
  const getVideoButtons = () => {
    if (!result || result.type !== "video") return [];
    const buttons: { label: string; url: string; primary: boolean }[] = [];

    if (result.hdUrl) {
      buttons.push({ label: "HD Quality", url: result.hdUrl, primary: true });
    }
    if (result.sdUrl && result.sdUrl !== result.hdUrl) {
      buttons.push({
        label: "SD Quality",
        url: result.sdUrl,
        primary: !result.hdUrl,
      });
    }
    // Fallback: if defaultUrl is different from both
    if (!result.hdUrl && !result.sdUrl && result.defaultUrl) {
      buttons.push({
        label: "Download Video",
        url: result.defaultUrl,
        primary: true,
      });
    }
    // If only one quality was found (just HD or just SD but labeled as default)
    if (buttons.length === 0 && result.defaultUrl) {
      buttons.push({
        label: "Download Video",
        url: result.defaultUrl,
        primary: true,
      });
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-blue-50 font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-600 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Facebook Tool v2.0
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                Videos &amp; Images
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              Vidi<span className="text-blue-600">Flow.</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Output
              </p>
              <p className="text-sm font-bold text-zinc-600">MP4 · JPG · HD</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-base leading-none">
                      f
                    </span>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Facebook Downloader
                  </span>
                </div>

                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Facebook URL
                    </label>
                    <Input
                      placeholder="https://www.facebook.com/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 transition-all"
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
                        <DownloadIcon className="h-3.5 w-3.5" /> Get Media
                      </span>
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span className="uppercase">{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info panel */}
            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    icon: <VideoIcon className="h-3 w-3" />,
                    label: "Facebook Videos",
                    desc: "HD + SD quality",
                  },
                  {
                    icon: <MonitorPlayIcon className="h-3 w-3" />,
                    label: "Facebook Reels",
                    desc: "Short videos",
                  },
                  {
                    icon: <ImageIcon className="h-3 w-3" />,
                    label: "Facebook Photos",
                    desc: "Full resolution JPG",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="text-blue-400 shrink-0">{item.icon}</div>
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
                  <span className="text-blue-400 font-bold">public</span> posts
                  work. Private content cannot be accessed.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center -rotate-6 border border-blue-100">
                      <span className="text-blue-200 font-black text-5xl leading-none">
                        f
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <DownloadIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Facebook URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste a public Facebook video or image link to download.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-col gap-8 items-center md:items-start">
                    {/* Thumbnail */}
                    <div className="relative group shrink-0">
                      {result.thumbnail ? (
                        <>
                          <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-blue-300 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                          <img
                            src={result.thumbnail}
                            alt="Preview"
                            className={`relative object-cover rounded-[20px] shadow-2xl border-4 border-white ${result.type === "image" ? "w-48 h-48" : "w-48 h-36"}`}
                            onError={(e: any) => {
                              e.target.style.display = "none";
                            }}
                          />
                          {result.type === "video" && (
                            <div className="absolute inset-0 rounded-[20px] flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 fill-zinc-900 ml-1"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-48 h-36 rounded-[20px] bg-zinc-100 border-4 border-white shadow-2xl flex items-center justify-center">
                          {result.type === "video" ? (
                            <VideoIcon className="h-12 w-12 text-zinc-200" />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-zinc-200" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info + buttons */}
                    <div className="flex-1 space-y-5 text-center md:text-left w-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                          <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            {result.type === "video" ? "Video" : "Image"} Found
                          </Badge>
                          {/* Show available quality tags */}
                          {result.type === "video" && (
                            <div className="flex gap-1.5">
                              {result.hdUrl && (
                                <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase">
                                  HD
                                </span>
                              )}
                              {result.sdUrl && (
                                <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500 uppercase">
                                  SD
                                </span>
                              )}
                              {!result.hdUrl &&
                                !result.sdUrl &&
                                result.defaultUrl && (
                                  <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500 uppercase">
                                    MP4
                                  </span>
                                )}
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase italic leading-tight line-clamp-2">
                          {result.title || "Facebook Media"}
                        </h3>
                      </div>

                      {/* ── VIDEO DOWNLOAD BUTTONS ── */}
                      {result.type === "video" && (
                        <div className="space-y-2.5 pt-2">
                          {getVideoButtons().map((btn) => (
                            <Button
                              key={btn.label}
                              onClick={() => handleDownload(btn.url, btn.label)}
                              disabled={!!downloading}
                              className={`w-full flex items-center justify-center gap-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                                btn.primary
                                  ? "h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
                                  : "h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                              }`}
                            >
                              {downloading === btn.label ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <>
                                  <DownloadIcon
                                    className={
                                      btn.primary ? "h-4 w-4" : "h-3.5 w-3.5"
                                    }
                                  />{" "}
                                  {btn.label}
                                </>
                              )}
                            </Button>
                          ))}

                          {/* No URLs found fallback */}
                          {getVideoButtons().length === 0 && (
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold uppercase text-center">
                              ⚠️ Video found but download URL unavailable. The
                              post may be restricted.
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── IMAGE DOWNLOAD BUTTON ── */}
                      {result.type === "image" && (
                        <div className="pt-2">
                          <Button
                            onClick={() =>
                              handleDownload(result.imageUrl, "image")
                            }
                            disabled={!!downloading}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                          >
                            {downloading === "image" ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              <>
                                <DownloadIcon className="h-4 w-4" /> Download
                                Image
                              </>
                            )}
                          </Button>
                        </div>
                      )}

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
