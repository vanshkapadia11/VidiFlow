"use client";

import * as React from "react";
import {
  VideoIcon,
  ZapIcon,
  BellIcon,
  CheckIcon,
  SparklesIcon,
  ClockIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

const plannedFeatures = [
  "4K / 1080p / 720p quality options",
  "No watermark, clean downloads",
  "YouTube Shorts support",
  "Fast CDN-powered speeds",
  "MP4 format, instant save",
];

export default function YouTubeDownloaderComingSoon() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-16 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-red-50 text-red-600 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Coming Soon
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                Under Construction
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              YTSave<span className="text-red-600">.</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Status
              </p>
              <p className="text-sm font-bold text-zinc-600">
                In Development 🛠️
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <BellIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Get Notified
                  </span>
                </div>

                {!submitted ? (
                  <form onSubmit={handleNotify} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                        Your Email
                      </label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-red-500/20 focus-visible:border-red-500/50 transition-all"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!email}
                      className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200"
                    >
                      <span className="flex items-center gap-2">
                        <BellIcon className="h-3.5 w-3.5" /> Notify Me When Live
                      </span>
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="font-black text-sm uppercase text-zinc-800">
                      You&apos;re on the list!
                    </p>
                    <p className="text-zinc-400 text-xs">
                      We&apos;ll notify you the moment this tool goes live.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Planned features */}
            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  What&apos;s Coming
                </span>
              </div>
              <div className="space-y-2">
                {plannedFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <CheckIcon className="h-2.5 w-2.5 text-red-400" />
                    </div>
                    <span className="text-zinc-300 text-[11px]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Coming soon visual */}
          <div className="lg:col-span-7">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                {/* Animated icon stack */}
                <div className="relative">
                  {/* Outer pulse rings */}
                  <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20 scale-150" />
                  <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse opacity-40 scale-125" />

                  {/* Icon box */}
                  <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-200 rotate-3">
                    <VideoIcon className="h-12 w-12 text-white" />
                    {/* Sparkle badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                      <SparklesIcon className="h-4 w-4 text-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-3 max-w-sm">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                    Currently in development
                  </p>
                  <h2 className="text-3xl font-black uppercase italic text-zinc-900 leading-tight">
                    YouTube Video
                    <br />
                    <span className="text-red-600">Downloader</span>
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    We&apos;re building a fast, reliable YouTube video
                    downloader with multi-quality support. Check back soon!
                  </p>
                </div>

                {/* ETA badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 rounded-full">
                    <ClockIcon className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider">
                      Coming Soon
                    </span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-zinc-300" />
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase text-red-500 tracking-wider">
                      In Progress
                    </span>
                  </div>
                </div>

                {/* Try other tools CTA */}
                <div className="w-full max-w-xs pt-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Try these tools now
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: "YT Audio Extractor",
                        href: "/youtube-audio-downloader",
                      },
                      {
                        label: "YT Thumbnail Downloader",
                        href: "/youtube-thumbnail-downloader",
                      },
                    ].map((tool) => (
                      <a
                        key={tool.href}
                        href={tool.href}
                        className="flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all group border border-zinc-100"
                      >
                        <span className="text-[11px] font-bold uppercase text-zinc-600 group-hover:text-zinc-900 transition-colors">
                          {tool.label}
                        </span>
                        <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <CreatorFooter />
    </div>
  );
}
