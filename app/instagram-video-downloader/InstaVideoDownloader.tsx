"use client";
import * as React from "react";
import {
  ZapIcon,
  BellIcon,
  CheckIcon,
  ClockIcon,
  ArrowRightIcon,
  DownloadIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

const plannedFeatures = [
  "Reels & short video downloads",
  "Single photo & carousel posts",
  "All carousel slides at once",
  "IGTV long-form videos",
  "No watermark, original quality",
];

export default function InstagramDownloaderComingSoon() {
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
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className="border-none text-[10px] font-bold uppercase rounded-full px-3"
                style={{
                  background:
                    "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  color: "white",
                }}
              >
                Coming Soon
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div
                  className="h-1 w-1 rounded-full animate-pulse"
                  style={{ background: "#e1306c" }}
                />
                Under Construction
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              InstaRip<span style={{ color: "#e1306c" }}>.</span>
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
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-50 p-2 rounded-lg">
                    <BellIcon className="h-4 w-4 text-pink-500" />
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
                        className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-pink-500/20 focus-visible:border-pink-400/50 transition-all"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!email}
                      className="w-full h-12 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg transition-all disabled:opacity-40"
                      style={{
                        background:
                          "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                        boxShadow: "0 6px 24px rgba(225,48,108,0.35)",
                      }}
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
                      You're on the list!
                    </p>
                    <p className="text-zinc-400 text-xs">
                      We'll notify you the moment this tool goes live.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Planned features */}
            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div
                className="flex items-center gap-2"
                style={{ color: "#e1306c" }}
              >
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  What's Coming
                </span>
              </div>
              <div className="space-y-2">
                {plannedFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <CheckIcon
                        className="h-2.5 w-2.5"
                        style={{ color: "#e1306c" }}
                      />
                    </div>
                    <span className="text-zinc-300 text-[11px]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                {/* Animated icon */}
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full opacity-20 scale-150 animate-ping"
                    style={{
                      background: "radial-gradient(circle, #f09433, #bc1888)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full opacity-30 scale-125 animate-pulse"
                    style={{
                      background: "radial-gradient(circle, #f09433, #bc1888)",
                    }}
                  />
                  <div
                    className="relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 border-4 border-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
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

                {/* Text */}
                <div className="space-y-3 max-w-sm">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                    Currently in development
                  </p>
                  <h2 className="text-3xl font-black uppercase italic text-zinc-900 leading-tight">
                    Instagram
                    <br />
                    <span
                      style={{
                        background: "linear-gradient(135deg, #f09433, #bc1888)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Downloader
                    </span>
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    We're building an Instagram downloader that handles Reels,
                    photos, carousels, and IGTV — all in one place. Check back
                    soon!
                  </p>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 rounded-full">
                    <ClockIcon className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider">
                      Coming Soon
                    </span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-zinc-300" />
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full"
                    style={{ background: "#fff0f5" }}
                  >
                    <div
                      className="h-2 w-2 rounded-full animate-pulse"
                      style={{ background: "#e1306c" }}
                    />
                    <span
                      className="text-[11px] font-black uppercase tracking-wider"
                      style={{ color: "#e1306c" }}
                    >
                      In Progress
                    </span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-zinc-300 hidden sm:block" />
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 rounded-full">
                    <span className="text-sm">🖼️</span>
                    <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider">
                      Posts &amp; Reels
                    </span>
                  </div>
                </div>

                {/* Try other tools */}
                <div className="w-full max-w-xs pt-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Try these tools now
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: "TikTok Downloader",
                        href: "/tiktok-video-downloader",
                      },
                      {
                        label: "Pinterest Downloader",
                        href: "/pinterest-video-downloader",
                      },
                      {
                        label: "YouTube Thumbnail",
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
      {/* <CreatorFooter /> */}
    </div>
  );
}
