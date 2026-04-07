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
} from "lucide-react";

const ComingSoonBadge = () => (
  <span className="ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 leading-none">
    Soon
  </span>
);

export default function CreatorFooter() {
  return (
    <footer className="w-full bg-white border-t border-zinc-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* TOP — BRANDING */}
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

        {/* MIDDLE — LINKS */}
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
              {/* ✅ BLOG IN FOOTER */}
              <li>
                <Link
                  href="/blog"
                  className="flex items-center gap-2 hover:text-green-600 transition-colors"
                >
                  <BookOpenIcon className="h-3.5 w-3.5 text-green-600" /> Blog &
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/video-transcriber"
                  className="flex items-center gap-2 hover:text-violet-600 transition-colors"
                >
                  <FileTextIcon className="h-3.5 w-3.5 text-violet-600" />{" "}
                  Transcriber
                </Link>
              </li>
            </ul>
          </div>

          {/* YouTube */}
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

          {/* Downloaders col 1 */}
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
              Downloaders
            </h5>
            <div className="space-y-3 text-sm font-bold text-zinc-500">
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
              {/* <li> */}
              <Link
                href="/video-transcriber"
                className="flex items-center gap-2 hover:text-violet-600 transition-colors"
              >
                <FileTextIcon className="h-3.5 w-3.5 text-violet-600" />{" "}
                Transcriber
              </Link>
              {/* </li> */}
            </div>
          </div>

          {/* Downloaders col 2 */}
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
              More Tools
            </h5>
            <div className="space-y-3 text-sm font-bold text-zinc-500">
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
              <Link
                href="/reddit-video-downloader"
                className="flex items-center gap-2 hover:text-orange-500 transition-colors"
              >
                <DownloadIcon className="h-3.5 w-3.5 text-orange-500" /> Reddit
                DL
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
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
