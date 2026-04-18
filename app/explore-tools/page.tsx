"use client";

import * as React from "react";
import Link from "next/link";
import {
  SearchIcon,
  VideoIcon,
  MusicIcon,
  ImageIcon,
  ZapIcon,
  SparklesIcon,
  FileTextIcon,
  CameraIcon,
  DownloadIcon,
  TvIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  LayersIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

const categories = [
  { id: "all", label: "All Tools" },
  { id: "youtube", label: "YouTube" },
  { id: "social", label: "Social Media" },
  { id: "seo", label: "SEO & Copy" },
];

const allFeatures = [
  {
    title: "YouTube Video DL",
    desc: "Download 4K & 1080p videos with zero watermarks.",
    icon: <VideoIcon className="h-5 w-5 text-red-600" />,
    category: "youtube",
    status: "Soon",
    href: "/youtube-video-downloader",
    color: "bg-red-50",
  },
  {
    title: "Video Transcriber",
    desc: "Transcribe any YouTube video to text using AI — 99 languages supported.",
    icon: <FileTextIcon className="h-5 w-5 text-violet-600" />,
    category: "seo",
    status: "Live",
    paid: true,
    href: "/video-transcriber",
    color: "bg-violet-50",
  },
  {
    title: "YouTube Audio",
    desc: "Extract high-bitrate MP3/WAV from any video link.",
    icon: <MusicIcon className="h-5 w-5 text-blue-500" />,
    category: "youtube",
    status: "Soon",
    href: "/youtube-audio-downloader",
    color: "bg-blue-50",
  },
  {
    title: "Tag Master",
    desc: "Generate high-ranking SEO tags using our AI engine.",
    icon: <ZapIcon className="h-5 w-5 text-amber-500" />,
    category: "seo",
    status: "Live",
    href: "/generate-tags",
    color: "bg-amber-50",
  },
  {
    title: "Thumbnail Grabber",
    desc: "Get full-res thumbnails (4K/HD) in one click.",
    icon: <ImageIcon className="h-5 w-5 text-red-500" />,
    category: "youtube",
    status: "Live",
    href: "/youtube-thumbnail-downloader",
    color: "bg-red-50",
  },
  {
    title: "TikTok Saver",
    desc: "Download TikToks without the jumping watermark.",
    icon: <CameraIcon className="h-5 w-5 text-zinc-900" />,
    category: "social",
    status: "Live",
    href: "/tiktok-video-downloader",
    color: "bg-zinc-100",
  },
  {
    title: "Pinterest DL",
    desc: "Save high-quality pins and video ideas instantly.",
    icon: <DownloadIcon className="h-5 w-5 text-rose-600" />,
    category: "social",
    status: "Live",
    href: "/pinterest-video-downloader",
    color: "bg-rose-50",
  },
  {
    title: "Desc Grabber",
    desc: "Analyze and copy descriptions for research.",
    icon: <FileTextIcon className="h-5 w-5 text-amber-600" />,
    category: "seo",
    status: "Live",
    href: "/generate-description",
    color: "bg-amber-50",
  },
  {
    title: "Instagram DL",
    desc: "Save Reels, Stories, and IGTV videos in HD.",
    icon: <CameraIcon className="h-5 w-5 text-pink-500" />,
    category: "social",
    status: "Soon",
    href: "/instagram-video-downloader",
    color: "bg-pink-50",
  },
  {
    title: "LinkedIn Saver",
    desc: "Download professional video content for offline use.",
    icon: <BriefcaseIcon className="h-5 w-5 text-blue-700" />,
    category: "social",
    status: "Live",
    href: "/linkedin-downloader",
    color: "bg-blue-50",
  },
  {
    title: "Twitch Clips",
    desc: "Grab gaming highlights and streams instantly.",
    icon: <TvIcon className="h-5 w-5 text-purple-600" />,
    category: "social",
    status: "Live",
    href: "/twitch-video-downloader",
    color: "bg-purple-50",
  },
];

export const toolsMetadata = {
  title: "All Video Downloaders — Every Tool in One Place | VidiFlow",
  description:
    "Browse all free video downloader tools on VidiFlow. Download from TikTok, YouTube, Instagram, Facebook, Pinterest, Snapchat, Twitter, LinkedIn and Twitch. All tools free, no app needed.",
  keywords: [
    "all video downloaders",
    "free online tools",
    "video downloader tools",
    "social media downloader",
    "download videos online free",
    "vidiflow tools",
  ],
  openGraph: {
    title: "All Video Downloaders — VidiFlow",
    description:
      "Every free video downloader in one place. TikTok, YouTube, Instagram, Facebook and more.",
    url: "https://vidiflow.co/tools",
  },
};

export default function ExploreFeatures() {
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  const filtered = allFeatures.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || f.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const liveCount = allFeatures.filter((f) => f.status === "Live").length;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 overflow-x-hidden">
      <Navbar />

      <main className="antialiased">
        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-16 pb-20 px-6 overflow-hidden">
          {/* Background blobs — identical to homepage hero */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-100/40 blur-[140px] rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-amber-100/30 blur-[100px] rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-40 left-0 w-[250px] h-[250px] bg-pink-100/30 blur-[100px] rounded-full -z-0 pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                  <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  VidiFlow Ecosystem
                </span>
              </div>
            </div>

            {/* Headline — same weight/style as homepage h1 */}
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-[clamp(3rem,9vw,7rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
                Explore{" "}
                <span className="relative inline-block">
                  <span className="text-red-600">Features.</span>
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
              </h1>
              <p className="max-w-lg mx-auto text-zinc-500 font-medium text-lg leading-relaxed">
                A comprehensive suite of tools designed to help you download,
                optimize, and scale your content creation workflow.
              </p>
            </div>

            {/* Stats strip — same card style as homepage */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { value: `${liveCount}`, label: "Live Tools" },
                { value: "4K", label: "Max Quality" },
                { value: "0", label: "Watermarks" },
                { value: "Free", label: "Forever" },
              ].map((s, i) => (
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

        {/* ─── SEARCH & FILTER ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-2.5 rounded-[22px] border border-zinc-200/60 shadow-sm">
            {/* Category tabs */}
            <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto px-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === cat.id
                      ? "bg-zinc-900 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-zinc-200 mx-1 shrink-0" />

            {/* Search */}
            <div className="relative w-full md:w-72 group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
              <input
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-10 border border-zinc-200 rounded-xl bg-zinc-50/50 font-black text-[10px] uppercase tracking-widest text-zinc-700 placeholder:text-zinc-300 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-red-400/60 focus:ring-2 focus:ring-red-500/10 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                >
                  <XIcon className="h-3 w-3 text-zinc-500" />
                </button>
              )}
            </div>

            {/* Result count pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl shrink-0 ml-auto">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </section>

        {/* ─── TOOLS GRID ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          {/* Section label — mirrors homepage tool grid header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                Everything You Need
              </p>
              <h2 className="text-3xl font-black uppercase italic tracking-tight leading-tight">
                Our <span className="text-red-600">Power</span> Tools
              </h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-xs text-right hidden md:block">
              Select any tool below to get started instantly. No signup
              required.
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((feature, i) => (
                <Link href={feature.href} key={i} className="group block">
                  <div className="relative h-full bg-white border border-zinc-200/60 rounded-[28px] p-7 transition-all duration-200 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-50 flex flex-col justify-between overflow-hidden">
                    {/* Hover fill — mirrors homepage tool card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                    <div className="relative z-10">
                      {/* Top row: icon + status */}
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`${feature.color} p-3.5 rounded-2xl border border-zinc-100/80`}
                        >
                          {feature.icon}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {feature.status === "Soon" ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase rounded-lg">
                              Coming Soon
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-lg">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span className="text-[9px] font-black uppercase text-green-700 tracking-wider">
                                Live
                              </span>
                            </div>
                          )}
                          {feature.paid && (
                            <span className="px-2.5 py-1 bg-zinc-900 text-white text-[9px] font-black uppercase rounded-lg">
                              Pro
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title + desc */}
                      <h3 className="text-lg font-black uppercase italic text-zinc-900 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>

                    {/* Card footer — mirrors homepage tool card arrow */}
                    <div className="relative z-10 mt-7 flex items-center justify-between pt-5 border-t border-zinc-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        {feature.status === "Soon"
                          ? "Coming Soon"
                          : "View Tool"}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-200">
                        <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-zinc-200 rounded-2xl shadow-sm mb-5">
                <LayersIcon className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-black uppercase italic text-zinc-400 mb-2">
                No tools found
              </h3>
              <p className="text-zinc-400 text-sm">
                Try a different search or category.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveTab("all");
                }}
                className="mt-5 px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* ─── BOTTOM CTA ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="relative bg-zinc-900 rounded-[40px] overflow-hidden p-12 md:p-16 text-center">
            {/* Bg effects — identical to homepage bottom CTA */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/80 border border-zinc-700 rounded-full">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                  <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Help Us Grow
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white leading-tight">
                Missing a Tool
                <br />
                <span className="text-red-500">You Need?</span>
              </h2>
              <p className="text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
                We're constantly expanding VidiFlow. Send us a request and we
                might build it next!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="mailto:vanshkapadia11@gmail.com">
                  <button className="h-13 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] shadow-2xl shadow-red-900/40">
                    Submit Request <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/">
                  <button className="h-13 px-8 py-3.5 bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all">
                    Back to Home
                  </button>
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
