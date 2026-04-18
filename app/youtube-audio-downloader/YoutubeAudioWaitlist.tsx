"use client";

import * as React from "react";
import {
  MusicIcon,
  BellIcon,
  CheckCircleIcon,
  SparklesIcon,
  Loader2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

const FEATURES = [
  "Convert YouTube to MP3 at 192kbps",
  "YouTube Shorts support",
  "No signup or account required",
  "Fast browser-based conversion",
  "No watermarks, no limits",
];

export default function YouTubeAudioWaitlist() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          feature: "youtube-audio-downloader",
        }),
      });
      if (!res.ok) throw new Error("Failed to join waitlist");
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
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
                variant="secondary"
                className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                Coming Soon
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                In Development
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              AudioRip<span className="text-red-600">.</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              YouTube → MP3 at 192kbps. Join the waitlist to get early access.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-5">
            {/* Waitlist form card */}
            <div className="bg-white border border-zinc-200/60 shadow-sm rounded-[24px] p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="bg-red-50 p-2 rounded-lg">
                  <BellIcon className="h-4 w-4 text-red-500" />
                </div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                  Join the Waitlist
                </span>
              </div>

              {status === "success" ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="font-black text-sm text-zinc-800 uppercase tracking-tight">
                    You're on the list!
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We'll email you the moment YouTube Audio Downloader goes
                    live.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      Your Email
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-red-500/20 focus-visible:border-red-500/50 transition-all"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-500 font-medium">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={!email || status === "loading"}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200 disabled:opacity-40"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Joining…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <BellIcon className="h-3.5 w-3.5" />
                        Notify Me
                      </span>
                    )}
                  </Button>

                  <p className="text-[10px] text-zinc-400 text-center">
                    No spam. One email when it launches.
                  </p>
                </form>
              )}
            </div>

            {/* What's coming */}
            <div className="p-5 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <SparklesIcon className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  What's coming
                </span>
              </div>
              <ul className="space-y-2.5">
                {FEATURES.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-zinc-300 text-[11px] leading-relaxed"
                  >
                    <span className="text-red-500 font-black mt-0.5 shrink-0">
                      →
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT — hero placeholder */}
          <div className="lg:col-span-8">
            <div className="border border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col items-center justify-center p-12 text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20 scale-150" />
                <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse opacity-40 scale-125" />
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-200 -rotate-3">
                  <MusicIcon className="h-12 w-12 text-white" />
                  <div className="absolute -bottom-3 flex items-end gap-0.5">
                    {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-red-400 rounded-full opacity-70"
                        style={{ height: `${h * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-w-sm">
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold uppercase rounded-full px-3 mx-auto"
                >
                  Coming Soon
                </Badge>
                <h2 className="text-3xl font-black uppercase italic text-zinc-900 leading-tight">
                  YouTube Audio
                  <br />
                  <span className="text-red-600">Extractor</span>
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  We're putting the finishing touches on our YouTube Audio
                  Downloader. Join the waitlist on the left and we'll let you
                  know the moment it's ready.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                {[
                  "192kbps MP3",
                  "YouTube Shorts",
                  "No Signup",
                  "Personal Use",
                ].map((tag) => (
                  <div
                    key={tag}
                    className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black uppercase text-zinc-400 tracking-wider"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* <CreatorFooter /> */}
    </div>
  );
}
