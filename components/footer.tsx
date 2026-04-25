"use client";

import * as React from "react";
import Link from "next/link";
import {
  HeartIcon,
  SparklesIcon,
  ZapIcon,
  FileTextIcon,
  MusicIcon,
  VideoIcon,
  ImageIcon,
  CameraIcon,
  DownloadIcon,
  TvIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
} from "lucide-react";

const ComingSoonBadge = () => (
  <span className="ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 leading-none">
    Soon
  </span>
);

const stats = [
  { value: "12+", label: "Tools" },
  { value: "4K", label: "Quality" },
  { value: "0", label: "Watermarks" },
  { value: "Free", label: "Forever" },
];

export default function CreatorFooter() {
  return (
    <footer className="w-full bg-zinc-900 text-white mt-20 relative overflow-hidden">
      {/* Background dot texture — mirrors "Why VidiFlow" section */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Ambient glow — mirrors hero blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

      {/* ── TOP CTA BAND ── mirrors bottom CTA section on homepage */}
      <div className="relative z-10 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Start Now — It's Free
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight leading-tight">
              Ready to <span className="text-red-500">Download</span> Anything?
            </h2>
            <p className="text-zinc-400 text-sm">
              No signup. No limits. Just paste a link and get your media.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link href="/explore-tools">
              <button className="h-12 px-7 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-red-900/40">
                Browse All Tools <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </Link>
            <Link href="/youtube-thumbnail-downloader">
              <button className="h-12 px-6 bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                Try a Free Tool
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── mirrors homepage stats */}
      <div className="relative z-10 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800/40">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-6 px-4 bg-zinc-900 hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-3xl font-[900] italic text-white leading-none">
                {s.value}
              </span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em] mt-1">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN LINKS GRID ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-red-400/20 blur-md rounded-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-900/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <SparklesIcon className="text-white h-6 w-6 fill-white/20" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                  Vidi<span className="text-red-500">Flow</span>
                </span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-1">
                  Premium Creator Suite
                </span>
              </div>
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              One platform for all your content needs. High-quality downloads,
              AI-powered metadata, and creator utilities — all free.
            </p>

            {/* Feature pills — mirrors "Why VidiFlow" section items */}
            <div className="space-y-3">
              {[
                {
                  icon: <ShieldCheckIcon className="h-4 w-4" />,
                  text: "No Watermarks",
                },
                {
                  icon: <ZapIcon className="h-4 w-4" />,
                  text: "Ultra Fast CDN",
                },
                {
                  icon: <CheckCircle2Icon className="h-4 w-4" />,
                  text: "Privacy First",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 group">
                  <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all duration-200 shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-10">
            {/* Creator Tools */}
            <div className="space-y-5">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
                  Category
                </p>
                <h5 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
                  Creator Tools
                </h5>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    href: "/generate-tags",
                    icon: <ZapIcon className="h-3.5 w-3.5 text-red-500" />,
                    label: "Tag Master",
                  },
                  {
                    href: "/generate-description",
                    icon: (
                      <FileTextIcon className="h-3.5 w-3.5 text-amber-500" />
                    ),
                    label: "Desc Grabber",
                  },
                  {
                    href: "/video-transcriber",
                    icon: (
                      <FileTextIcon className="h-3.5 w-3.5 text-violet-500" />
                    ),
                    label: "Transcriber",
                  },
                  {
                    href: "/blog",
                    icon: (
                      <BookOpenIcon className="h-3.5 w-3.5 text-green-500" />
                    ),
                    label: "Blog & Guides",
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors group"
                    >
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* YouTube */}
            <div className="space-y-5">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
                  Category
                </p>
                <h5 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
                  YouTube Suite
                </h5>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    href: "/youtube-audio-downloader",
                    icon: <MusicIcon className="h-3.5 w-3.5 text-blue-400" />,
                    label: "YT Audio",
                    soon: true,
                  },
                  {
                    href: "/youtube-video-downloader",
                    icon: <VideoIcon className="h-3.5 w-3.5 text-red-500" />,
                    label: "YT Video",
                    soon: true,
                  },
                  {
                    href: "/youtube-thumbnail-downloader",
                    icon: <ImageIcon className="h-3.5 w-3.5 text-red-400" />,
                    label: "YT Thumbnail",
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors group"
                    >
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      {item.label}
                      {item.soon && <ComingSoonBadge />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Downloaders */}
            <div className="space-y-5">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
                  Category
                </p>
                <h5 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
                  Downloaders
                </h5>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    href: "/tiktok-video-downloader",
                    icon: <CameraIcon className="h-3.5 w-3.5 text-zinc-300" />,
                    label: "TikTok DL",
                  },
                  {
                    href: "/pinterest-video-downloader",
                    icon: (
                      <DownloadIcon className="h-3.5 w-3.5 text-rose-400" />
                    ),
                    label: "Pinterest DL",
                  },
                  {
                    href: "/instagram-video-downloader",
                    icon: <CameraIcon className="h-3.5 w-3.5 text-pink-400" />,
                    label: "Instagram DL",
                    soon: true,
                  },
                  {
                    href: "/twitter-video-downloader",
                    icon: <VideoIcon className="h-3.5 w-3.5 text-zinc-300" />,
                    label: "Twitter / X DL",
                  },
                  {
                    href: "/twitch-video-downloader",
                    icon: <TvIcon className="h-3.5 w-3.5 text-purple-400" />,
                    label: "Twitch DL",
                  },
                  {
                    href: "/linkedin-video-downloader",
                    icon: (
                      <BriefcaseIcon className="h-3.5 w-3.5 text-blue-400" />
                    ),
                    label: "LinkedIn DL",
                  },
                  {
                    href: "/reddit-video-downloader",
                    icon: (
                      <DownloadIcon className="h-3.5 w-3.5 text-orange-400" />
                    ),
                    label: "Reddit DL",
                  },
                  {
                    href: "/facebook-video-downloader",
                    icon: <VideoIcon className="h-3.5 w-3.5 text-blue-400" />,
                    label: "Facebook DL",
                  },
                  {
                    href: "/snapchat-video-downloader",
                    icon: (
                      <CameraIcon className="h-3.5 w-3.5 text-yellow-400" />
                    ),
                    label: "Snapchat DL",
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors group"
                    >
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      {item.label}
                      {item.soon && <ComingSoonBadge />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="relative z-10 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em]">
            © 2026 VIDIFLOW. ALL RIGHTS RESERVED.
          </p>

          <div className="flex items-center gap-4">
            {/* Active status chip — mirrors hero */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/60 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">
                12+ Tools Active
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600 uppercase tracking-wider">
              <span>Made with</span>
              <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
