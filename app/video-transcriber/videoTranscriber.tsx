"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ZapIcon,
  Trash2Icon,
  Link2Icon,
  FileTextIcon,
  CopyIcon,
  DownloadIcon,
  MicIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import { useUser } from "@clerk/nextjs";

interface Segment {
  id: number;
  start: number; // seconds
  end: number;
  text: string;
}

interface TranscribeResult {
  transcript: string;
  segments?: Segment[];
  words?: number;
  language?: string;
  duration?: number;
}

export default function VideoTranscriber() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscribeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subChecked, setSubChecked] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.replace("/video-transcriber/auth-gate");
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        setIsSubscribed(data.isSubscribed);
        if (!data.isSubscribed) setShowPricing(true);
      })
      .finally(() => setSubChecked(true));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const buildExportText = () => {
    if (!result) return "";
    if (result.segments?.length) {
      return result.segments
        .map((seg) => `[${formatTime(seg.start)}]  ${seg.text.trim()}`)
        .join("\n");
    }
    return result.transcript;
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !isSubscribed) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Error ${res.status}`);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    setCheckoutLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setCheckoutLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(buildExportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([buildExportText()], { type: "text/plain" });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `transcript-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-violet-50 font-sans text-zinc-900">
      <Navbar />

      {/* ── PRICING MODAL ── */}
      {showPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto">
                <MicIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                Unlock Transcriber
              </h2>
              <p className="text-zinc-500 text-sm">
                Get unlimited AI transcriptions — any YouTube video, 99
                languages
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCheckout("monthly")}
                disabled={checkoutLoading}
                className="p-5 border-2 border-zinc-200 hover:border-violet-500 rounded-[20px] text-left transition-all group disabled:opacity-50"
              >
                <p className="text-[10px] font-bold uppercase text-zinc-400 group-hover:text-violet-500 tracking-widest mb-1">
                  Monthly
                </p>
                <p className="text-2xl font-black text-zinc-900">$9</p>
                <p className="text-[10px] text-zinc-400">per month</p>
              </button>
              <button
                onClick={() => handleCheckout("yearly")}
                disabled={checkoutLoading}
                className="p-5 border-2 border-violet-500 bg-violet-50 rounded-[20px] text-left transition-all relative disabled:opacity-50"
              >
                <span className="absolute -top-2.5 right-3 bg-violet-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Save 27%
                </span>
                <p className="text-[10px] font-bold uppercase text-violet-500 tracking-widest mb-1">
                  Yearly
                </p>
                <p className="text-2xl font-black text-zinc-900">$79</p>
                <p className="text-[10px] text-zinc-400">per year</p>
              </button>
            </div>
            {checkoutLoading && (
              <p className="text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-3 w-3" /> Redirecting to
                checkout...
              </p>
            )}
            <div className="space-y-2 text-[11px] text-zinc-500">
              {[
                "Unlimited transcriptions",
                "99 languages supported",
                "AI-powered accuracy",
                "Cancel anytime",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-zinc-100 text-zinc-600 border-none text-[10px] font-bold uppercase rounded-full px-3">
                VidiFlow AI
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                AI Powered · Pro
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 italic uppercase">
              Transcribe<span className="text-violet-600">.</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Output Format
              </p>
              <p className="text-sm font-bold text-zinc-600">
                Timestamped · TXT
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── LEFT ── */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                    <MicIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Video Transcriber
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Video URL
                    </label>
                    <button
                      onClick={reset}
                      className="text-zinc-300 hover:text-violet-500 transition-colors"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <form onSubmit={handleFetch} className="space-y-4">
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50 transition-all"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !url || !isSubscribed}
                      className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-violet-200 disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <span className="flex items-center gap-2">
                          <MicIcon className="h-3.5 w-3.5" /> Transcribe Video
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dark info panel */}
            <div className="p-5 bg-zinc-900 rounded-[24px] text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-violet-400">
                <ZapIcon className="h-3.5 w-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Features
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: "🎬",
                    label: "YouTube Support",
                    desc: "Any public YouTube video",
                  },
                  {
                    icon: "🌍",
                    label: "99 Languages",
                    desc: "Auto language detection",
                  },
                  {
                    icon: "⚡",
                    label: "AI Powered",
                    desc: "Whisper model accuracy",
                  },
                  {
                    icon: "🕐",
                    label: "Timestamps",
                    desc: "Every sentence timestamped",
                  },
                  {
                    icon: "📄",
                    label: "Export as TXT",
                    desc: "Download transcript file",
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
                  ⚠️ Only{" "}
                  <span className="text-violet-400 font-bold">public</span>{" "}
                  videos can be transcribed.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col transition-all">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-violet-50 flex items-center justify-center border border-violet-100">
                    <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                      Transcribing...
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      This may take 30-60 seconds depending on video length.
                    </p>
                  </div>
                </div>
              ) : !result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-50 flex items-center justify-center rotate-3 border border-zinc-100">
                      <FileTextIcon className="w-12 h-12 text-zinc-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                      <MicIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Video URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste any public YouTube video link to get the full
                      transcript instantly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  {/* Result header */}
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase font-black px-3 py-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Transcript Ready
                    </Badge>
                    <div className="flex items-center gap-4 text-zinc-400 text-[10px] font-bold uppercase">
                      {result.words && <span>{result.words} words</span>}
                      {result.segments?.length && (
                        <span>{result.segments.length} segments</span>
                      )}
                      {result.language && <span>{result.language}</span>}
                      {result.duration && (
                        <span>{formatTime(result.duration)}</span>
                      )}
                    </div>
                  </div>

                  {/* Timestamped segments */}
                  <div className="h-72 overflow-y-auto rounded-[20px] bg-zinc-50 border border-zinc-100 p-5 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                    {result.segments && result.segments.length > 0 ? (
                      result.segments.map((seg) => (
                        <div key={seg.id} className="flex items-start gap-3">
                          <span className="text-[10px] font-black text-violet-500 font-mono mt-1 shrink-0 w-10 tabular-nums bg-violet-50 px-1.5 py-0.5 rounded-md text-center">
                            {formatTime(seg.start)}
                          </span>
                          <p className="text-zinc-700 text-sm leading-relaxed">
                            {seg.text.trim()}
                          </p>
                        </div>
                      ))
                    ) : (
                      // Fallback if no segments returned
                      <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                        {result.transcript}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleCopy}
                      className="h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[20px] font-black uppercase text-[11px] shadow-xl transition-transform active:scale-95"
                    >
                      <CopyIcon className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy Text"}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-[20px] font-black uppercase text-[11px] shadow-xl shadow-violet-200 transition-transform active:scale-95"
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    onClick={reset}
                    className="w-full hover:text-zinc-900 font-bold uppercase text-[10px]"
                  >
                    <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Transcribe
                    Another
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
