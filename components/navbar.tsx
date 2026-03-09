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
  MenuIcon,
  BookOpenIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  // ── Creator Tools ──
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

  // ── YouTube ──
  {
    group: "YouTube",
    name: "YT Audio",
    href: "/youtube-audio-downloader",
    icon: MusicIcon,
    color: "text-blue-500",
    bg: "bg-blue-50",
    comingSoon: true,
  },
  {
    group: "YouTube",
    name: "YT Video",
    href: "/youtube-video-downloader",
    icon: VideoIcon,
    color: "text-red-600",
    bg: "bg-red-50",
    comingSoon: true,
  },
  {
    group: "YouTube",
    name: "YT Thumbnail",
    href: "/youtube-thumbnail-downloader",
    icon: ImageIcon,
    color: "text-red-500",
    bg: "bg-red-50",
    comingSoon: false,
  },

  // ── Downloaders ──
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
  {
    group: "Downloaders",
    name: "Twitch DL",
    href: "/twitch-video-downloader",
    icon: TvIcon,
    color: "text-purple-600",
    bg: "bg-purple-50",
    comingSoon: false,
  },
  {
    group: "Downloaders",
    name: "LinkedIn DL",
    href: "/linkedin-video-downloader",
    icon: BriefcaseIcon,
    color: "text-blue-700",
    bg: "bg-blue-50",
    comingSoon: false,
  },
];

const desktopPrimary = [
  "Tag Master",
  "YT Audio",
  "YT Video",
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
      <header className="sticky top-0 z-[100] w-full bg-white">
        <div className="h-[3px] w-full bg-gradient-to-r from-red-600 via-zinc-900 to-red-600" />

        <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center gap-3 active:scale-95 transition-transform shrink-0"
            >
              <div className="bg-red-600 p-2.5 rounded-xl shadow-lg">
                <SparklesIcon className="text-white h-5 w-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-zinc-900 italic uppercase tracking-tighter leading-none">
                  Vidi<span className="text-red-600">Flow</span>
                </span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                  Creator Toolbox
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks
                .filter((l) => desktopPrimary.includes(l.name))
                .map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative px-3 py-2 text-[11px] font-bold rounded-xl flex items-center gap-1.5 uppercase transition-all whitespace-nowrap",
                      pathname === link.href
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
                    )}
                  >
                    <link.icon className={cn("h-3.5 w-3.5", link.color)} />
                    {link.name}
                    {link.comingSoon && (
                      <span className="ml-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 leading-none">
                        Soon
                      </span>
                    )}
                  </Link>
                ))}

              {/* ✅ BLOG LINK */}
              <Link
                href="/blog"
                className={cn(
                  "relative px-3 py-2 text-[11px] font-bold rounded-xl flex items-center gap-1.5 uppercase transition-all whitespace-nowrap",
                  pathname === "/blog" || pathname.startsWith("/blog/")
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
                )}
              >
                <BookOpenIcon className="h-3.5 w-3.5 text-green-600" />
                Blog
              </Link>

              {/* MORE DROPDOWN */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setShowMore((v) => !v)}
                  className={cn(
                    "px-3 py-2 text-[11px] font-bold rounded-xl flex items-center gap-1.5 uppercase transition-all",
                    showMore
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
                  )}
                >
                  <MenuIcon className="h-3.5 w-3.5" />
                  More
                  <ChevronRightIcon
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      showMore && "rotate-90",
                    )}
                  />
                </button>

                {showMore && (
                  <div className="absolute top-full right-0 mt-2 w-[540px] bg-white rounded-2xl shadow-2xl border border-zinc-100 p-5 z-[200]">
                    <div className="grid grid-cols-2 gap-5">
                      {groups.map((group) => (
                        <div key={group}>
                          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-2 px-1">
                            {group}
                          </p>
                          <div className="space-y-0.5">
                            {navLinks
                              .filter((l) => l.group === group)
                              .map((link) => (
                                <Link
                                  key={link.name}
                                  href={link.href}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[11px] font-bold uppercase",
                                    pathname === link.href
                                      ? "bg-zinc-900 text-white"
                                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "p-1.5 rounded-lg shrink-0",
                                      pathname === link.href
                                        ? "bg-white/10"
                                        : link.bg,
                                    )}
                                  >
                                    <link.icon
                                      className={cn(
                                        "h-3.5 w-3.5",
                                        pathname === link.href
                                          ? "text-white"
                                          : link.color,
                                      )}
                                    />
                                  </div>
                                  <span className="flex-1">{link.name}</span>
                                  {link.comingSoon && (
                                    <span
                                      className={cn(
                                        "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none shrink-0",
                                        pathname === link.href
                                          ? "bg-white/20 text-white"
                                          : "bg-amber-100 text-amber-600",
                                      )}
                                    >
                                      Soon
                                    </span>
                                  )}
                                </Link>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE TOGGLE */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="lg:hidden h-11 w-11 rounded-xl bg-zinc-50 border border-zinc-200"
            >
              <div className="flex flex-col gap-1">
                <span className="h-0.5 w-5 bg-zinc-800 rounded-full" />
                <span className="h-0.5 w-5 bg-zinc-800 rounded-full" />
              </div>
            </Button>
          </div>
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={cn(
          "fixed inset-0 z-[150] lg:hidden transition-all duration-300",
          isOpen ? "visible" : "invisible",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-zinc-950/40 backdrop-blur-md transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-6 pb-4 shrink-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Navigation
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full"
            >
              <XIcon className="h-5 w-5 text-zinc-500" />
            </Button>
          </div>

          {/* Scrollable grouped links */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
            {/* ✅ BLOG LINK IN MOBILE */}
            <div>
              <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-2 px-1">
                Resources
              </p>
              <Link
                href="/blog"
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-95",
                  pathname === "/blog" || pathname.startsWith("/blog/")
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 text-zinc-700",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl shadow-sm",
                      pathname === "/blog" || pathname.startsWith("/blog/")
                        ? "bg-white/10"
                        : "bg-white",
                    )}
                  >
                    <BookOpenIcon
                      className={cn(
                        "h-4 w-4",
                        pathname === "/blog" || pathname.startsWith("/blog/")
                          ? "text-white"
                          : "text-green-600",
                      )}
                    />
                  </div>
                  <span className="font-bold uppercase text-xs tracking-tight">
                    Blog
                  </span>
                </div>
                <ChevronRightIcon className="h-4 w-4 opacity-40 shrink-0" />
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
                    .map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-95",
                          pathname === link.href
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-50 text-zinc-700",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-xl shadow-sm",
                              pathname === link.href
                                ? "bg-white/10"
                                : "bg-white",
                            )}
                          >
                            <link.icon
                              className={cn(
                                "h-4 w-4",
                                pathname === link.href
                                  ? "text-white"
                                  : link.color,
                              )}
                            />
                          </div>
                          <span className="font-bold uppercase text-xs tracking-tight">
                            {link.name}
                          </span>
                          {link.comingSoon && (
                            <span
                              className={cn(
                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none",
                                pathname === link.href
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 text-amber-600",
                              )}
                            >
                              Soon
                            </span>
                          )}
                        </div>
                        <ChevronRightIcon className="h-4 w-4 opacity-40 shrink-0" />
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-100 p-6 text-center shrink-0">
            <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.3em]">
              VidiFlow Pro
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
