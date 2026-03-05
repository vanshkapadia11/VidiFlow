"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

const toolCategories = [
  {
    title: "YouTube Suite",
    icon: <VideoIcon className="h-5 w-5 text-red-600" />,
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
        name: "LinkedIn DL",
        href: "/linkedin-downloader",
        icon: <TvIcon className="h-4 w-4" />,
      },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="antialiased">
        {/* --- HERO SECTION --- */}
        <section className="relative pt-20 pb-16 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="bg-white border-zinc-200 text-zinc-500 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
              >
                <SparklesIcon className="h-3 w-3 mr-2 text-red-600 fill-red-600/20" />
                The Ultimate Creator Toolkit
              </Badge>
            </div>

            <h1 className="text-6xl md:text-8xl font-[1000] tracking-tighter uppercase italic leading-[0.9]">
              Create <span className="text-red-700">Fast.</span>
              <br />
              Download <span className="text-red-700 font-black">Faster.</span>
            </h1>

            <p className="max-w-xl mx-auto text-zinc-500 font-medium text-lg">
              One platform for all your content needs. High-quality video
              downloads, AI-powered metadata generation, and creator utilities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore-tools" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-zinc-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-200"
                >
                  Explore All Tools <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-700 uppercase">
                  12+ Tools Active
                </span>
              </div>
            </div>
          </div>

          {/* Background Decorative Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-100/30 blur-[120px] rounded-full -z-0" />
        </section>

        {/* --- FEATURE GRID --- */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tight">
                Our <span className="text-red-600">Power</span> Tools
              </h2>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
                Select a category to get started
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {toolCategories.map((cat, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-zinc-100">
                    {cat.icon}
                  </div>
                  <h3 className="font-black uppercase text-sm tracking-wider">
                    {cat.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {cat.tools.map((tool, tIdx) => (
                    <Link href={tool.href} key={tIdx} className="group block">
                      <Card className="border-zinc-200/60 hover:border-red-500/50 hover:shadow-md transition-all duration-300 rounded-[20px] overflow-hidden bg-white">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                              {tool.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-800 group-hover:text-red-600 transition-colors">
                                {tool.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tighter">
                                {tool.status === "Soon"
                                  ? "Coming Soon"
                                  : "Ready to use"}
                              </p>
                            </div>
                          </div>
                          {tool.status === "Soon" ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-50 text-amber-600 border-none text-[9px] font-black uppercase rounded-lg"
                            >
                              Soon
                            </Badge>
                          ) : (
                            <ArrowRightIcon className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- WHY VIDIFLOW --- */}
        <section className="bg-zinc-900 py-24 text-white">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-red-600 text-white border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                The VidiFlow Edge
              </Badge>
              <h2 className="text-5xl font-black uppercase italic leading-[1.1]">
                Built for <span className="text-red-500">Creators</span> who
                value speed.
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "No Watermarks",
                    desc: "All our downloads are clean and ready for professional use.",
                    icon: <ShieldCheckIcon className="text-red-500" />,
                  },
                  {
                    title: "Ultra Fast",
                    desc: "CDN powered downloads ensure you spend less time waiting.",
                    icon: <ZapIcon className="text-red-500" />,
                  },
                  {
                    title: "Privacy First",
                    desc: "We don't track your downloads or store your media files.",
                    icon: <CheckCircle2Icon className="text-red-500" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold uppercase text-sm tracking-wide">
                        {item.title}
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-linear-to-br from-zinc-800 to-zinc-900 rounded-[40px] border border-zinc-700 flex items-center justify-center p-12 overflow-hidden group">
                {/* <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-900 rotate-6 group-hover:rotate-12 transition-transform duration-500">
                    <PlayIcon className="h-10 w-10 text-white fill-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                    Processing Media
                  </p>
                </div>

                {/* Floating UI elements mock */}
                <div className="absolute top-10 right-10 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-[10px] font-bold animate-bounce">
                  4K Quality
                </div>
                <div className="absolute bottom-20 left-10 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-[10px] font-bold">
                  Fast CDN
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CreatorFooter />
    </div>
  );
}
