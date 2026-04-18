import * as React from "react";
import Link from "next/link";
import {
  ZapIcon,
  SparklesIcon,
  VideoIcon,
  MusicIcon,
  ImageIcon,
  CameraIcon,
  DownloadIcon,
  TvIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  PlayIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";
import { getAllPosts } from "@/lib/blog";

const toolCategories = [
  {
    title: "YouTube Suite",
    icon: <VideoIcon className="h-5 w-5 text-red-600" />,
    color: "red",
    tools: [
      {
        name: "Video Downloader",
        href: "/youtube-video-downloader",
        status: "Soon",
        icon: <VideoIcon className="h-4 w-4" />,
      },
      {
        name: "Audio Extractor",
        href: "/youtube-audio-downloader",
        status: "Soon",
        icon: <MusicIcon className="h-4 w-4" />,
      },
      {
        name: "Thumbnail Grabber",
        href: "/youtube-thumbnail-downloader",
        icon: <ImageIcon className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Social Media",
    icon: <CameraIcon className="h-5 w-5 text-pink-500" />,
    color: "pink",
    tools: [
      {
        name: "Instagram DL",
        href: "/instagram-video-downloader",
        status: "Soon",
        icon: <CameraIcon className="h-4 w-4" />,
      },
      {
        name: "TikTok DL",
        href: "/tiktok-video-downloader",
        icon: <DownloadIcon className="h-4 w-4" />,
      },
      {
        name: "Pinterest DL",
        href: "/pinterest-video-downloader",
        icon: <DownloadIcon className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Professional",
    icon: <ZapIcon className="h-5 w-5 text-amber-500" />,
    color: "amber",
    tools: [
      {
        name: "Tag Master",
        href: "/generate-tags",
        icon: <ZapIcon className="h-4 w-4" />,
      },
      {
        name: "Desc Grabber",
        href: "/generate-description",
        icon: <SparklesIcon className="h-4 w-4" />,
      },
      {
        name: "Video Transcriber",
        href: "/video-transcriber",
        icon: <FileTextIcon className="h-4 w-4" />,
        status: "Pro",
        paid: true,
      },
      {
        name: "LinkedIn DL",
        href: "/linkedin-downloader",
        icon: <TvIcon className="h-4 w-4" />,
      },
    ],
  },
];

const stats = [
  { value: "12+", label: "Active Tools" },
  { value: "4K", label: "Max Quality" },
  { value: "0", label: "Watermarks" },
  { value: "Free", label: "Forever" },
];

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 overflow-x-hidden">
      <Navbar />

      <main className="antialiased">
        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-16 pb-20 px-6 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-100/40 blur-[140px] rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-amber-100/30 blur-[100px] rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-40 left-0 w-[250px] h-[250px] bg-pink-100/30 blur-[100px] rounded-full -z-0 pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Badge row */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                  <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  The Ultimate Creator Toolkit
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
                Create{" "}
                <span className="relative inline-block">
                  <span className="text-red-600">Fast.</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6 Q50 2 100 4 Q150 6 198 2"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                  </svg>
                </span>
                <br />
                Download{" "}
                <span className="text-red-600">Faster.</span>
              </h1>
              <p className="max-w-lg mx-auto text-zinc-500 font-medium text-lg leading-relaxed">
                One platform for all your content needs. High-quality downloads,
                AI-powered metadata, and creator utilities — all free.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link href="/explore-tools">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-zinc-800 hover:scale-[1.02] transition-all shadow-xl shadow-zinc-300/50 border border-zinc-800"
                >
                  Explore All Tools <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 h-14 px-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                  12+ Tools Active
                </span>
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center py-4 px-3 bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
                >
                  <span className="text-2xl font-[900] italic text-zinc-900 leading-none">
                    {s.value}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TOOL GRID ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                Everything You Need
              </p>
              <h2 className="text-4xl font-black uppercase italic tracking-tight leading-tight">
                Our <span className="text-red-600">Power</span> Tools
              </h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-xs text-right hidden md:block">
              Select any tool below to get started instantly. No signup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {toolCategories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-zinc-100">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs tracking-wider text-zinc-800">
                      {cat.title}
                    </h3>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                      {cat.tools.length} tools
                    </p>
                  </div>
                </div>

                {/* Tool cards */}
                <div className="space-y-2.5">
                  {cat.tools.map((tool, tIdx) => (
                    <Link href={tool.href} key={tIdx} className="group block">
                      <div className="relative flex items-center justify-between p-4 bg-white border border-zinc-200/60 rounded-[18px] hover:border-red-400/60 hover:shadow-md hover:shadow-red-50 transition-all duration-200 overflow-hidden">
                        {/* Hover fill */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-red-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all duration-200 shrink-0">
                            {tool.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-800 group-hover:text-red-600 transition-colors leading-tight">
                              {tool.name}
                            </p>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">
                              {tool.status === "Soon"
                                ? "Coming Soon"
                                : tool.status === "Pro"
                                ? "Pro Feature"
                                : "Ready to use"}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 shrink-0">
                          {tool.status === "Soon" ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase rounded-lg">
                              Soon
                            </span>
                          ) : tool.status === "Pro" ? (
                            <span className="px-2.5 py-1 bg-zinc-900 text-white text-[9px] font-black uppercase rounded-lg">
                              Pro
                            </span>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-200">
                              <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WHY VIDIFLOW ─────────────────────────────────────────── */}
        <section className="relative bg-zinc-900 py-28 text-white overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-10">
              <div>
                <Badge className="bg-red-600 text-white border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-6">
                  The VidiFlow Edge
                </Badge>
                <h2 className="text-5xl font-black uppercase italic leading-[1.05]">
                  Built for{" "}
                  <span className="text-red-500">Creators</span>
                  <br />
                  who value speed.
                </h2>
              </div>

              <div className="space-y-7">
                {[
                  {
                    title: "No Watermarks",
                    desc: "All downloads are clean and ready for professional use.",
                    icon: <ShieldCheckIcon className="h-5 w-5" />,
                  },
                  {
                    title: "Ultra Fast",
                    desc: "CDN powered downloads ensure you spend less time waiting.",
                    icon: <ZapIcon className="h-5 w-5" />,
                  },
                  {
                    title: "Privacy First",
                    desc: "We don't track downloads or store your media files.",
                    icon: <CheckCircle2Icon className="h-5 w-5" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-black uppercase text-sm tracking-wide text-white">
                        {item.title}
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="relative aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[40px] border border-zinc-700/60 overflow-hidden p-10 flex flex-col justify-between">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Center icon */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full scale-150" />
                    <div className="relative w-24 h-24 bg-red-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-red-900/50 rotate-6 hover:rotate-12 transition-transform duration-500 cursor-default">
                      <PlayIcon className="h-12 w-12 text-white fill-white" />
                    </div>
                  </div>
                </div>

                {/* Floating chips */}
                <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-2 bg-zinc-800/90 backdrop-blur-sm rounded-xl border border-zinc-700 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">4K Quality</span>
                </div>

                <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-2 bg-red-600/90 backdrop-blur-sm rounded-xl shadow-lg">
                  <ZapIcon className="h-3 w-3 text-white fill-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Fast CDN</span>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        Processing
                      </span>
                      <span className="text-[9px] font-black text-red-400 uppercase">
                        100%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-300">
                      video_final_4k.mp4 — Ready to download
                    </p>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-4 bg-red-900/10 blur-2xl rounded-full -z-10 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ─── BLOG ──────────────────────────────────────────────────── */}
        {recentPosts.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                  From the Blog
                </p>
                <h2 className="text-4xl font-black uppercase italic tracking-tight">
                  Guides &amp; <span className="text-red-600">Tips.</span>
                </h2>
              </div>
              <Link
                href="/blog"
                className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-black text-[11px] uppercase tracking-widest transition-colors"
              >
                View All Articles
                <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentPosts.map((post, i) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <div
                    className={`h-full flex flex-col justify-between rounded-[24px] border p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      i === 0
                        ? "bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700"
                        : "bg-white border-zinc-100 hover:border-zinc-200"
                    }`}
                  >
                    <div className="space-y-3">
                      <span
                        className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                          i === 0
                            ? "bg-red-600 text-white"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {post.category}
                      </span>
                      <h3
                        className={`font-black uppercase italic text-sm leading-tight line-clamp-2 group-hover:text-red-500 transition-colors ${
                          i === 0 ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {post.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed line-clamp-3 ${
                          i === 0 ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {post.description}
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-between mt-6 pt-4 border-t ${
                        i === 0 ? "border-zinc-800" : "border-zinc-100"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 text-[9px] font-bold uppercase ${
                          i === 0 ? "text-zinc-500" : "text-zinc-400"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-2.5 w-2.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-2.5 w-2.5" />
                          {post.readTime}m
                        </span>
                      </div>
                      <ArrowRightIcon
                        className={`h-3.5 w-3.5 group-hover:translate-x-1 transition-all ${
                          i === 0
                            ? "text-zinc-600 group-hover:text-red-500"
                            : "text-zinc-300 group-hover:text-red-600"
                        }`}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── BOTTOM CTA ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="relative bg-zinc-900 rounded-[40px] overflow-hidden p-12 md:p-16 text-center">
            {/* Bg effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10 space-y-6">
              <Badge className="bg-red-600 text-white border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                Start Now — It's Free
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white leading-tight">
                Ready to <span className="text-red-500">Download</span>
                <br />
                Anything?
              </h2>
              <p className="text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
                No signup. No limits. Just paste a link and get your media.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/explore-tools">
                  <Button
                    size="lg"
                    className="h-14 px-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-red-900/40 transition-all hover:scale-[1.02]"
                  >
                    Browse All Tools <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/youtube-thumbnail-downloader">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all"
                  >
                    Try a Free Tool
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CreatorFooter />
    </div>
  );
}