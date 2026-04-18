"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SparklesIcon,
  ZapIcon,
  ChevronRightIcon,
  DownloadIcon,
  MusicIcon,
  CameraIcon,
  FileTextIcon,
  XIcon,
  ImageIcon,
  VideoIcon,
  TvIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  {
    group: "Creator Tools",
    name: "Tag Master",
    href: "/generate-tags",
    icon: ZapIcon,
    color: "text-red-600",
    bg: "bg-red-50",
    comingSoon: false,
  },
  {
    group: "Creator Tools",
    name: "Desc Grabber",
    href: "/generate-description",
    icon: FileTextIcon,
    color: "text-amber-500",
    bg: "bg-amber-50",
    comingSoon: false,
  },
  {
    group: "More Vidiflow Tools",
    name: "YT Audio",
    href: "/youtube-audio-downloader",
    icon: MusicIcon,
    color: "text-blue-500",
    bg: "bg-blue-50",
    comingSoon: true,
  },
  {
    group: "More Vidiflow Tools",
    name: "YT Video",
    href: "/youtube-video-downloader",
    icon: VideoIcon,
    color: "text-red-600",
    bg: "bg-red-50",
    comingSoon: true,
  },
  {
    group: "Creator Tools",
    name: "Transcriber",
    href: "/video-transcriber",
    icon: FileTextIcon,
    color: "text-violet-600",
    bg: "bg-violet-50",
    comingSoon: false,
  },
  {
    group: "More Vidiflow Tools",
    name: "YT Thumbnail",
    href: "/youtube-thumbnail-downloader",
    icon: ImageIcon,
    color: "text-red-500",
    bg: "bg-red-50",
    comingSoon: false,
  },
  {
    group: "More Vidiflow Tools",
    name: "Reddit DL",
    href: "/reddit-video-downloader",
    icon: DownloadIcon,
    color: "text-orange-500",
    bg: "bg-orange-50",
    comingSoon: false,
  },
  {
    group: "More Vidiflow Tools",
    name: "Twitch DL",
    href: "/twitch-video-downloader",
    icon: TvIcon,
    color: "text-purple-600",
    bg: "bg-purple-50",
    comingSoon: false,
  },
  {
    group: "More Vidiflow Tools",
    name: "LinkedIn DL",
    href: "/linkedin-video-downloader",
    icon: BriefcaseIcon,
    color: "text-blue-700",
    bg: "bg-blue-50",
    comingSoon: false,
  },
  {
    group: "Downloaders",
    name: "TikTok DL",
    href: "/tiktok-video-downloader",
    icon: CameraIcon,
    color: "text-zinc-900",
    bg: "bg-zinc-100",
    comingSoon: false,
  },
  {
    group: "Downloaders",
    name: "Pinterest DL",
    href: "/pinterest-video-downloader",
    icon: DownloadIcon,
    color: "text-rose-600",
    bg: "bg-rose-50",
    comingSoon: false,
  },
  {
    group: "Downloaders",
    name: "Instagram DL",
    href: "/instagram-video-downloader",
    icon: CameraIcon,
    color: "text-pink-500",
    bg: "bg-pink-50",
    comingSoon: true,
  },
  {
    group: "Downloaders",
    name: "Facebook DL",
    href: "/facebook-video-downloader",
    icon: VideoIcon,
    color: "text-blue-600",
    bg: "bg-blue-50",
    comingSoon: false,
  },
  {
    group: "Downloaders",
    name: "Snapchat DL",
    href: "/snapchat-video-downloader",
    icon: CameraIcon,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    comingSoon: false,
  },
  {
    group: "Downloaders",
    name: "Twitter / X DL",
    href: "/twitter-video-downloader",
    icon: VideoIcon,
    color: "text-zinc-800",
    bg: "bg-zinc-100",
    comingSoon: false,
  },
];

const desktopPrimary = [
  "Tag Master",
  "Transcriber",
  "YT Thumbnail",
  "TikTok DL",
  "Pinterest DL",
];

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);
  const pathname = usePathname();
  const moreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    setIsOpen(false);
    setShowMore(false);
  }, [pathname]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const groups = Array.from(new Set(navLinks.map((l) => l.group)));

  return (
    <>
      <header className="sticky top-0 z-[100] w-full">
        {/* Top accent bar — matches hero color palette */}
        <div className="h-[3px] w-full bg-gradient-to-r from-red-600 via-zinc-900 to-red-600" />

        <nav className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-sm shadow-zinc-100/60">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
            {/* ── LOGO ── */}
            <Link
              href="/"
              className="flex items-center gap-3 active:scale-95 transition-transform shrink-0 group"
            >
              <div className="relative">
                {/* Glow behind icon — mirrors hero blobs */}
                <div className="absolute inset-0 bg-red-400/30 blur-md rounded-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-200">
                  <SparklesIcon className="text-white h-5 w-5 fill-white/20" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-zinc-900 italic uppercase tracking-tighter leading-none">
                  Vidi<span className="text-red-600">Flow</span>
                </span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Creator Toolbox
                </span>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks
                .filter((l) => desktopPrimary.includes(l.name))
                .map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "relative px-3.5 py-2 text-[10px] font-black rounded-xl flex items-center gap-1.5 uppercase tracking-widest transition-all whitespace-nowrap group",
                        active
                          ? "bg-zinc-900 text-white shadow-md"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60",
                      )}
                    >
                      {/* Active left bar — mirrors tool card hover accent */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-red-500 rounded-full" />
                      )}
                      <link.icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          active ? "text-red-400" : link.color,
                        )}
                      />
                      {link.name}
                      {link.comingSoon && (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 leading-none">
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })}

              {/* Blog link */}
              <Link
                href="/blog"
                className={cn(
                  "relative px-3.5 py-2 text-[11px] font-black rounded-xl flex items-center gap-1.5 uppercase tracking-widest transition-all whitespace-nowrap",
                  pathname === "/blog" || pathname.startsWith("/blog/")
                    ? "bg-zinc-900 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60",
                )}
              >
                {(pathname === "/blog" || pathname.startsWith("/blog/")) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-red-500 rounded-full" />
                )}
                <BookOpenIcon className="h-3.5 w-3.5 text-green-500" />
                Blog
              </Link>

              {/* More dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setShowMore((v) => !v)}
                  className={cn(
                    "px-3.5 py-2 text-[11px] font-black rounded-xl flex items-center gap-1.5 uppercase tracking-widest transition-all border",
                    showMore
                      ? "bg-zinc-900 text-white border-zinc-800 shadow-md"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-transparent hover:border-zinc-200/60",
                  )}
                >
                  All Tools
                  <ChevronRightIcon
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      showMore && "rotate-90",
                    )}
                  />
                </button>

                {showMore && (
                  <div
                    className={cn(
                      "absolute top-full right-0 mt-3 bg-white rounded-[24px] shadow-2xl shadow-zinc-200/80 border border-zinc-100/80 p-6 z-[200]",
                      "w-[580px] max-w-[calc(100vw-48px)]",
                      "max-h-[calc(100vh-120px)] overflow-y-auto",
                      "[&::-webkit-scrollbar]:w-1.5",
                      "[&::-webkit-scrollbar-track]:bg-transparent",
                      "[&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:rounded-full",
                    )}
                  >
                    {/* Dropdown header — mirrors section headings */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-100">
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.25em]">
                          Everything You Need
                        </p>
                        <h3 className="text-base font-black uppercase italic tracking-tight text-zinc-900 leading-tight">
                          Our <span className="text-red-600">Power</span> Tools
                        </h3>
                      </div>
                      <Link
                        href="/explore-tools"
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        See All <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {groups.map((group) => (
                        <div key={group}>
                          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-2.5 px-1">
                            {group}
                          </p>
                          <div className="space-y-1">
                            {navLinks
                              .filter((l) => l.group === group)
                              .map((link) => {
                                const active = pathname === link.href;
                                return (
                                  <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                      "group flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all text-[11px] font-black uppercase tracking-wider relative overflow-hidden",
                                      active
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                                    )}
                                  >
                                    {/* Hover fill — mirrors tool card */}
                                    {!active && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-red-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[14px]" />
                                    )}
                                    <div
                                      className={cn(
                                        "p-1.5 rounded-lg shrink-0 relative z-10",
                                        active ? "bg-white/10" : link.bg,
                                      )}
                                    >
                                      <link.icon
                                        className={cn(
                                          "h-3.5 w-3.5",
                                          active ? "text-white" : link.color,
                                        )}
                                      />
                                    </div>
                                    <span className="flex-1 relative z-10">
                                      {link.name}
                                    </span>
                                    {link.comingSoon && (
                                      <span
                                        className={cn(
                                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none shrink-0 relative z-10",
                                          active
                                            ? "bg-white/20 text-white"
                                            : "bg-amber-100 text-amber-600",
                                        )}
                                      >
                                        Soon
                                      </span>
                                    )}
                                    {!active && !link.comingSoon && (
                                      <ArrowRightIcon className="h-3 w-3 text-zinc-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all relative z-10" />
                                    )}
                                  </Link>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── DESKTOP CTA ── */}
            <div className="hidden lg:flex items-center shrink-0">
              <Link href="/explore-tools">
                <button className="h-10 px-5 bg-zinc-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 hover:scale-[1.02] transition-all shadow-md shadow-zinc-300/40 flex items-center gap-2 border border-zinc-800">
                  Explore Tools <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

            {/* ── MOBILE TOGGLE ── */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden h-11 w-11 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col items-center justify-center gap-1.5 hover:bg-zinc-100 transition-colors"
            >
              <span className="h-0.5 w-5 bg-zinc-800 rounded-full" />
              <span className="h-0.5 w-3.5 bg-zinc-500 rounded-full" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={cn(
          "fixed inset-0 z-[150] lg:hidden transition-all duration-300",
          isOpen ? "visible" : "invisible",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-zinc-950/50 backdrop-blur-md transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-[310px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col overflow-hidden",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Drawer top accent */}
          <div className="h-[3px] w-full bg-gradient-to-r from-red-600 via-zinc-900 to-red-600 shrink-0" />

          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-red-600 p-2 rounded-lg shadow-sm">
                <SparklesIcon className="text-white h-4 w-4 fill-white/20" />
              </div>
              <div>
                <span className="text-sm font-black text-zinc-900 italic uppercase tracking-tight">
                  Vidi<span className="text-red-600">Flow</span>
                </span>
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
                  Creator Toolbox
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center hover:bg-zinc-100 transition-colors"
            >
              <XIcon className="h-4 w-4 text-zinc-500" />
            </button>
          </div>

          {/* Drawer body */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {/* Resources */}
            <div>
              <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-2 px-1">
                Resources
              </p>
              <Link
                href="/blog"
                className={cn(
                  "flex items-center justify-between p-4 rounded-[18px] transition-all active:scale-95 group relative overflow-hidden",
                  pathname === "/blog" || pathname.startsWith("/blog/")
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 border border-zinc-100 text-zinc-700 hover:border-zinc-200",
                )}
              >
                {!(pathname === "/blog" || pathname.startsWith("/blog/")) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-red-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[18px]" />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={cn(
                      "p-2 rounded-xl",
                      pathname === "/blog" || pathname.startsWith("/blog/")
                        ? "bg-white/10"
                        : "bg-white border border-zinc-100",
                    )}
                  >
                    <BookOpenIcon
                      className={cn(
                        "h-4 w-4",
                        pathname === "/blog" || pathname.startsWith("/blog/")
                          ? "text-white"
                          : "text-green-500",
                      )}
                    />
                  </div>
                  <div>
                    <span className="font-black uppercase text-xs tracking-tight">
                      Blog & Guides
                    </span>
                    <p
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                        pathname === "/blog" || pathname.startsWith("/blog/")
                          ? "text-zinc-400"
                          : "text-zinc-400",
                      )}
                    >
                      Tips & tutorials
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 opacity-30 shrink-0 relative z-10" />
              </Link>
            </div>

            {groups.map((group) => (
              <div key={group}>
                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-2 px-1">
                  {group}
                </p>
                <div className="space-y-1.5">
                  {navLinks
                    .filter((l) => l.group === group)
                    .map((link) => {
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={cn(
                            "flex items-center justify-between p-3.5 rounded-[16px] transition-all active:scale-95 group relative overflow-hidden",
                            active
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-50 border border-zinc-100 text-zinc-700 hover:border-zinc-200",
                          )}
                        >
                          {!active && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-red-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[16px]" />
                          )}
                          <div className="flex items-center gap-3 relative z-10">
                            <div
                              className={cn(
                                "p-2 rounded-xl shrink-0",
                                active
                                  ? "bg-white/10"
                                  : cn(
                                      "bg-white border border-zinc-100",
                                      link.bg
                                        .replace("bg-", "border-")
                                        .replace("-50", "-100/50"),
                                    ),
                              )}
                            >
                              <link.icon
                                className={cn(
                                  "h-4 w-4",
                                  active ? "text-white" : link.color,
                                )}
                              />
                            </div>
                            <div>
                              <span className="font-black uppercase text-xs tracking-tight">
                                {link.name}
                              </span>
                              {link.comingSoon && (
                                <span
                                  className={cn(
                                    "ml-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none",
                                    active
                                      ? "bg-white/20 text-white"
                                      : "bg-amber-100 text-amber-600",
                                  )}
                                >
                                  Soon
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 opacity-30 shrink-0 relative z-10" />
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer footer — mirrors homepage bottom CTA */}
          <div className="border-t border-zinc-100 p-5 shrink-0 bg-zinc-50">
            <Link href="/explore-tools" onClick={() => setIsOpen(false)}>
              <button className="w-full h-12 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-md shadow-zinc-300/40 border border-zinc-800">
                Explore All Tools <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </Link>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">
                12+ Tools Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
