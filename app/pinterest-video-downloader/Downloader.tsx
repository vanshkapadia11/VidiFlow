"use client";

import * as React from "react";
import { useState } from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ArrowDownToLineIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";
import PageContent from "@/components/pageContent";

interface PinterestResult {
  mediaUrl: string;
  isVideo: boolean;
}

export default function PinterestDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<PinterestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/download", {
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

  const handleDownload = async () => {
    if (!result || downloading) return;
    setDownloading(true);
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(result.mediaUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const ext = result.isVideo
        ? "mp4"
        : blob.type.includes("png")
          ? "png"
          : "jpg";
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `PinSave-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      setError("Download failed: " + (err as Error).message);
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
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #e60023, #ad081b)",
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  PinSave Pro
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                Images &amp; Videos
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Pin
              <span className="relative inline-block">
                <span className="text-red-600">Save.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#e60023"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Download Pinterest images and videos in original quality — JPG,
              PNG, MP4, no login needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "4K", label: "Max Quality" },
              { value: "JPG", label: "Images" },
              { value: "MP4", label: "Videos" },
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
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #e60023, #ad081b)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Pinterest Downloader
                  </span>
                </div>
                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Pinterest URL
                    </label>
                    <Input
                      placeholder="https://pinterest.com/pin/..."
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
                        <ArrowDownToLineIcon className="h-3.5 w-3.5" /> Extract
                        Media
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
              <div className="flex items-center gap-2 text-red-400">
                <ZapIcon className="h-3.5 w-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: "🖼️",
                    label: "4K Images",
                    desc: "Original resolution",
                  },
                  { icon: "🎬", label: "Videos", desc: "MP4, no watermark" },
                  {
                    icon: "🔗",
                    label: "Short Links",
                    desc: "pin.it auto-resolved",
                  },
                  {
                    icon: "⚡",
                    label: "Fast Extract",
                    desc: "< 1s processing",
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
                  pins can be downloaded.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col transition-all">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center -rotate-6 border border-red-100">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-12 h-12 fill-red-200"
                      >
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                      <DownloadIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Pinterest URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste a public pin to download its image or video.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-2 bg-red-400/20 rounded-[28px] blur-md" />
                      {result.isVideo ? (
                        <video
                          src={result.mediaUrl}
                          className="relative w-48 h-80 object-cover rounded-[24px] shadow-2xl border-4 border-white"
                          controls
                        />
                      ) : (
                        <img
                          src={result.mediaUrl}
                          className="relative w-48 h-80 object-cover rounded-[24px] shadow-2xl border-4 border-white"
                          alt="Pinterest pin"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-6 text-center md:text-left py-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase font-black px-3 py-1">
                            <CheckCircle2Icon className="h-3 w-3 mr-1" />
                            Ready to download
                          </Badge>
                          <span
                            className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${result.isVideo ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}
                          >
                            {result.isVideo ? "🎬 MP4" : "🖼️ Image"}
                          </span>
                        </div>
                        <h3 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tight">
                          {result.isVideo ? "Video Ready" : "Image Ready"}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {[
                            {
                              label: "Type",
                              value: result.isVideo ? "MP4 Video" : "HD Image",
                            },
                            { label: "Quality", value: "Original" },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100 text-center"
                            >
                              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                {stat.label}
                              </p>
                              <p className="text-sm font-black text-zinc-800 uppercase italic mt-0.5">
                                {stat.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <Button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full h-16 text-white rounded-[20px] font-black uppercase text-sm shadow-xl transition-transform active:scale-95"
                          style={{
                            background:
                              "linear-gradient(135deg, #e60023, #ad081b)",
                            boxShadow: "0 8px 24px rgba(230,0,35,0.3)",
                          }}
                        >
                          {downloading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            <span className="flex items-center gap-2">
                              <DownloadIcon className="h-4 w-4" />
                              Download {result.isVideo ? "Video" : "Image"}
                            </span>
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
