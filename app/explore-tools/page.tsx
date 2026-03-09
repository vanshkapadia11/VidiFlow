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
  ArrowUpRightIcon,
  LayersIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 antialiased">
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge className="bg-red-50 text-red-600 border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest">
            VidiFlow Ecosystem
          </Badge>
          <h1 className="text-5xl md:text-7xl font-[1000] tracking-tighter uppercase italic text-zinc-900">
            Explore <span className="text-red-600">Features</span>
          </h1>
          <p className="max-w-xl text-zinc-500 font-medium">
            A comprehensive suite of tools designed to help you download,
            optimize, and scale your content creation workflow.
          </p>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white p-2 rounded-[24px] border border-zinc-200/60 shadow-sm">
          <div className="flex items-center flex-wrap gap-2 overflow-x-auto w-full md:w-auto px-2 py-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === cat.id
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-11 pr-4 border-zinc-200 rounded-xl bg-zinc-50/50 font-bold text-xs uppercase tracking-widest focus-visible:ring-red-500/20"
            />
          </div>
        </div>

        {/* --- TOOLS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((feature, i) => (
              <Link href={feature.href} key={i} className="group">
                <div className="h-full bg-white border border-zinc-200/60 rounded-[32px] p-8 transition-all duration-300 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className={`${feature.color} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                      >
                        {feature.icon}
                      </div>
                      {feature.status === "Soon" ? (
                        <Badge className="bg-amber-100 text-amber-600 border-none text-[9px] font-black uppercase px-2 py-1">
                          Coming Soon
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                            Live Now
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-black uppercase italic text-zinc-900 mb-2 group-hover:text-red-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-zinc-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      View Tool
                    </span>
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-full mb-4">
                <LayersIcon className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-black uppercase italic text-zinc-400">
                No tools found matching your search.
              </h3>
            </div>
          )}
        </div>

        {/* --- BOTTOM CTA --- */}
        <div className="mt-20 p-12 bg-zinc-900 rounded-[40px] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white uppercase italic leading-tight">
              Missing a tool you need?
            </h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              We are constantly expanding VidiFlow. Send us a request and we
              might build it!
            </p>
            <div className="pt-4">
              <Link href="mailto:vanshkapadia11@gmail.com">
                <button className="bg-white text-zinc-900 px-8 py-3 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5">
                  Submit Request
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <CreatorFooter />
    </div>
  );
}
