// app/blog/page.tsx
// NO "use client" — server component for SEO

import type { Metadata } from "next";
import Link from "next/link";
// import { getAllPosts } from "@/lib/blog";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Video Downloading Tips, Guides & Tutorials | VidiFlow",
  description:
    "Learn how to download videos from TikTok, YouTube, Instagram, Facebook and more. Free guides, tips and tutorials for saving videos on any device.",
  keywords: [
    "video downloader guide",
    "how to download tiktok videos",
    "how to download youtube videos",
    "video downloading tips",
    "save instagram reels",
    "vidiflow blog",
  ],
  alternates: {
    canonical: "https://www.vidiflow.co/blog",
  },
  openGraph: {
    title: "VidiFlow Blog — Video Downloading Guides & Tips",
    description:
      "Free guides on how to download videos from any platform. TikTok, YouTube, Instagram and more.",
    url: "https://www.vidiflow.co/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                  <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  VidiFlow Blog
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                {posts.length} Articles
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Guides &amp;
              <span className="relative inline-block ml-3">
                <span className="text-red-600">Tips.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Learn how to download, save and manage videos from any platform
              for free.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: `${posts.length}`, label: "Articles" },
              { value: "Free", label: "Forever" },
              { value: "HD", label: "Tutorials" },
              { value: "All", label: "Platforms" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-3 px-4 bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
              >
                <span className="text-xl font-[900] italic text-zinc-900 leading-none">
                  {s.value}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-zinc-100">
            <p className="text-5xl mb-4">✍️</p>
            <h3 className="text-zinc-900 font-black text-2xl uppercase italic">
              Coming Soon
            </h3>
            <p className="text-zinc-400 mt-2 text-sm">
              Blog posts are being written. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* FEATURED POST */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block">
                <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left — text */}
                    <div className="p-8 md:p-12 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase bg-red-50 text-red-600">
                            Featured
                          </span>
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase bg-zinc-100 text-zinc-500">
                            {featured.category}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic text-zinc-900 leading-tight group-hover:text-red-600 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                          {featured.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {featured.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {featured.readTime} min read
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-red-600 font-black text-[11px] uppercase group-hover:gap-2 transition-all">
                          Read <ArrowRightIcon className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Right — big number/visual */}
                    <div className="bg-zinc-900 p-12 flex items-center justify-center min-h-[240px]">
                      <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                          Latest Guide
                        </p>
                        <p className="text-8xl font-black text-white italic opacity-10 leading-none">
                          01
                        </p>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                          {featured.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* REST OF POSTS — 3 column grid */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">
                  All Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((post, i) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group"
                    >
                      <div className="bg-white rounded-[24px] border border-zinc-100 p-6 h-full flex flex-col justify-between hover:shadow-lg hover:border-zinc-200 transition-all duration-200">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-2 py-1 rounded-lg uppercase bg-zinc-100 text-zinc-500">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="font-black text-zinc-900 uppercase italic text-sm leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3">
                            {post.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-50">
                          <div className="flex items-center gap-3 text-[9px] text-zinc-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-2.5 w-2.5" />
                              {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-2.5 w-2.5" />
                              {post.readTime}m
                            </span>
                          </div>
                          <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <CreatorFooter />
    </div>
  );
}
