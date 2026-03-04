"use client";

import * as React from "react";
import Link from "next/link";
import {
  TwitterIcon,
  GithubIcon,
  HeartIcon,
  MailIcon,
  CircleIcon,
  ZapIcon,
  SparklesIcon,
  FileTextIcon,
  MusicIcon,
  VideoIcon,
  ImageIcon,
  CameraIcon,
  DownloadIcon,
  TvIcon,
  BriefcaseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ComingSoonBadge = () => (
  <span className="ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 leading-none">
    Soon
  </span>
);

export default function CreatorFooter() {
  return (
    <footer className="w-full bg-white border-t border-zinc-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* TOP SECTION: BOLD BRANDING CENTERED */}
        <div className="flex flex-col items-center justify-center text-center pb-16 border-b border-zinc-100">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <SparklesIcon className="text-white h-7 w-7 fill-white/20" />
            </div>

            <div className="flex flex-center mt-2">
              <span className="text-5xl font-[1000] tracking-tighter text-zinc-900 uppercase italic">
                Vidi<span className="text-red-600">Flow</span>
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.5em] mt-1">
              Premium Creator Suite
            </span>
          </Link>
        </div>

        {/* MIDDLE SECTION: LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16">
          {/* Creator Tools */}
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
              Creator Tools
            </h5>
            <ul className="space-y-3 text-sm font-bold text-zinc-500">
              <li>
                <Link
                  href="/generate-tags"
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <ZapIcon className="h-3.5 w-3.5 text-red-600" /> Tag Master
                </Link>
              </li>
              <li>
                <Link
                  href="/generate-description"
                  className="flex items-center gap-2 hover:text-amber-500 transition-colors"
                >
                  <FileTextIcon className="h-3.5 w-3.5 text-amber-500" /> Desc
                  Grabber
                </Link>
              </li>
            </ul>
          </div>

          {/* YouTube Section */}
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
              YouTube
            </h5>
            <ul className="space-y-3 text-sm font-bold text-zinc-500">
              <li>
                <Link
                  href="/youtube-audio-downloader"
                  className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                >
                  <MusicIcon className="h-3.5 w-3.5 text-blue-500" /> YT Audio{" "}
                  <ComingSoonBadge />
                </Link>
              </li>
              <li>
                <Link
                  href="/youtube-video-downloader"
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <VideoIcon className="h-3.5 w-3.5 text-red-600" /> YT Video{" "}
                  <ComingSoonBadge />
                </Link>
              </li>
              <li>
                <Link
                  href="/youtube-thumbnail-downloader"
                  className="flex items-center gap-2 hover:text-red-500 transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-red-500" /> YT
                  Thumbnail
                </Link>
              </li>
            </ul>
          </div>

          {/* Downloaders Grid (Expanded) */}
          <div className="space-y-6 col-span-1">
            <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
              Downloaders
            </h5>
            <div className="grid grid-cols-1 gap-3 text-sm font-bold text-zinc-500">
              <Link
                href="/tiktok-video-downloader"
                className="flex items-center gap-2 hover:text-zinc-900 transition-colors"
              >
                <CameraIcon className="h-3.5 w-3.5 text-zinc-900" /> TikTok DL
              </Link>
              <Link
                href="/pinterest-video-downloader"
                className="flex items-center gap-2 hover:text-rose-600 transition-colors"
              >
                <DownloadIcon className="h-3.5 w-3.5 text-rose-600" /> Pinterest
                DL
              </Link>
              <Link
                href="/instagram-video-downloader"
                className="flex items-center gap-2 hover:text-pink-500 transition-colors"
              >
                <CameraIcon className="h-3.5 w-3.5 text-pink-500" /> Instagram
                DL <ComingSoonBadge />
              </Link>
              <Link
                href="/facebook-video-downloader"
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <VideoIcon className="h-3.5 w-3.5 text-blue-600" /> Facebook DL
              </Link>
              <Link
                href="/snapchat-video-downloader"
                className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
              >
                <CameraIcon className="h-3.5 w-3.5 text-yellow-500" /> Snapchat
                DL
              </Link>
              <Link
                href="/twitter-video-downloader"
                className="flex items-center gap-2 hover:text-zinc-800 transition-colors"
              >
                <VideoIcon className="h-3.5 w-3.5 text-zinc-800" /> Twitter / X
                DL
              </Link>
              <Link
                href="/twitch-video-downloader"
                className="flex items-center gap-2 hover:text-purple-600 transition-colors"
              >
                <TvIcon className="h-3.5 w-3.5 text-purple-600" /> Twitch DL
              </Link>
              <Link
                href="/linkedin-video-downloader"
                className="flex items-center gap-2 hover:text-blue-700 transition-colors"
              >
                <BriefcaseIcon className="h-3.5 w-3.5 text-blue-700" /> LinkedIn
                DL
              </Link>
            </div>
          </div>

          {/* Support & Connect */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
                Support
              </h5>
              <Link
                href="mailto:vanshkapadia11@gmail.com"
                className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <MailIcon className="h-4 w-4" />
                <span className="lowercase">vanshkapadia11@gmail.com</span>
              </Link>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl w-fit">
                <CircleIcon className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-tight">
                  Status: Optimal
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
                Socials
              </h5>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-2xl border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 h-11 w-11 shadow-sm transition-all"
                >
                  <GithubIcon className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.25em]">
            © 2026 VIDIFLOW. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-zinc-500 uppercase tracking-wider">
            <span>Made with</span>
            <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
