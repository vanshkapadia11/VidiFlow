"use client";

import * as React from "react";
import { useState } from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  ImageIcon,
  VideoIcon,
  AlertCircleIcon,
  MoveRight,
  SparklesIcon,
  Link2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

export default function PinterestDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setDebugInfo(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setResult(data);
      setDebugInfo(
        `Type: ${data.isVideo ? "VIDEO" : "IMAGE"} | URL: ${data.mediaUrl}`,
      );
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
      setError("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
    setDebugInfo(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-red-50 text-red-600 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Pinterest Engine v2.0
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />{" "}
                HD Extraction Active
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              PinSave<span className="text-red-600">.</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6 lowercase italic">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Support
              </p>
              <p className="text-sm font-bold text-zinc-600">Images / Videos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: INPUT AREA */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Pinterest URL
                    </label>
                    <Input
                      placeholder="Paste link here..."
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
                      "Extract Media"
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase italic">
                    <AlertCircleIcon className="h-3.5 w-3.5" /> {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-2 space-y-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <ZapIcon className="h-3 w-3 text-red-500 fill-red-500" /> System
                Features
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "4K Images",
                  "MP4 Videos",
                  "No Quality Loss",
                  "Direct Proxy",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="bg-white border border-zinc-200 text-zinc-500 text-[10px] font-bold py-1.5 px-3 rounded-lg uppercase tracking-tight"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS AREA */}
          <div className="lg:col-span-7">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[450px] flex flex-col relative">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-50 flex items-center justify-center rotate-3 border border-zinc-100">
                    <SparklesIcon className="h-8 w-8 text-zinc-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Link
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[200px] leading-relaxed lowercase italic">
                      Paste a Pinterest link to extract the high-resolution
                      source file.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-red-500 to-orange-400 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      {result.isVideo ? (
                        <video
                          src={result.mediaUrl}
                          className="relative w-48 h-72 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                          controls
                        />
                      ) : (
                        <img
                          src={result.mediaUrl}
                          className="relative w-48 h-72 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                          alt="Pinterest Content"
                        />
                      )}
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="space-y-2 text-center md:text-left">
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                          Asset Verified
                        </Badge>
                        <h3 className="text-2xl font-black text-zinc-900 uppercase italic leading-none">
                          Media Ready
                        </h3>
                        <p className="text-zinc-400 text-xs font-mono break-all line-clamp-1">
                          {result.mediaUrl}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">
                            Format
                          </p>
                          <p className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                            {result.isVideo ? (
                              <VideoIcon className="h-3 w-3" />
                            ) : (
                              <ImageIcon className="h-3 w-3" />
                            )}
                            {result.isVideo ? "MP4 VIDEO" : "HD IMAGE"}
                          </p>
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">
                            Speed
                          </p>
                          <p className="text-xs font-bold text-zinc-700">
                            ~0.8s Extr.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <Button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-100"
                        >
                          {downloading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <DownloadIcon className="h-4 w-4" /> Download
                              Final File
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={reset}
                          className="w-full text-zinc-400 hover:text-red-600 font-bold uppercase text-[10px] tracking-tighter"
                        >
                          <RotateCcwIcon className="mr-2 h-3 w-3" /> Clear
                          Console
                        </Button>
                      </div>
                    </div>
                  </div>

                  {debugInfo && (
                    <div className="mt-4 p-3 bg-zinc-50 rounded-xl text-[9px] text-zinc-400 font-mono border border-zinc-100/50 truncate">
                      LOG_DATA: {debugInfo}
                    </div>
                  )}
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
