import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  ZapIcon,
  ShieldCheckIcon,
  HeartIcon,
  MailIcon,
  LayersIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About VidiFlow — Free Creator Toolkit",
  description:
    "VidiFlow is a free toolkit for creators — video downloaders, metadata tools, and utilities for TikTok, YouTube, Pinterest and more. No signup, no watermarks, no tracking.",
  alternates: {
    canonical: "https://www.vidiflow.co/about",
  },
  openGraph: {
    title: "About VidiFlow",
    description:
      "A free, fast, no-login toolkit built for creators who just want their media without friction.",
    url: "https://www.vidiflow.co/about",
  },
};

const values = [
  {
    icon: ZapIcon,
    title: "Fast by default",
    desc: "Paste a link, get your file. No queues, no waiting rooms, no upsells in the way of a simple download.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Privacy first",
    desc: "We don't store the media you download or build profiles on what you've downloaded. The file goes from source to your device.",
  },
  {
    icon: LayersIcon,
    title: "One toolkit, not ten tabs",
    desc: "Downloaders, tag generators, transcribers and thumbnail grabbers live in one place instead of ten different sketchy sites.",
  },
  {
    icon: HeartIcon,
    title: "Free, actually",
    desc: "Core tools stay free. We're not going to lock the download button behind a paywall after you've already pasted your link.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* Hero */}
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full"
                style={{ background: "linear-gradient(135deg, #e60023, #ad081b)" }}
              />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                About
              </span>
            </div>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,5rem)] font-black tracking-tighter uppercase italic leading-[0.9] text-zinc-900">
            Built for people
            <br />
            who make <span className="text-red-600">stuff.</span>
          </h1>

          <p className="mt-5 text-zinc-500 font-medium text-base leading-relaxed">
            VidiFlow started as a single TikTok downloader because every
            existing one was slow, covered in pop-ups, or quietly installed
            something nobody asked for. It grew into a small toolkit for the
            parts of making content that aren't actually the fun part —
            grabbing a clip, pulling a thumbnail, writing a caption — so you
            can get back to the part that is.
          </p>
        </div>

        {/* Stats row, reused language from the rest of the site */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {[
            { value: "12+", label: "Tools Active" },
            { value: "0", label: "Signups Required" },
            { value: "0", label: "Watermarks Added" },
            { value: "Free", label: "Forever" },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-4 px-4 bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
            >
              <span className="text-xl font-[900] italic text-zinc-900 leading-none">
                {s.value}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1 text-center">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Values grid */}
        <div className="mb-14">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">
            What we actually care about
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v) => (
              <Card
                key={v.title}
                className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white"
              >
                <CardContent className="p-6 flex gap-4 items-start">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #e60023, #ad081b)" }}
                  >
                    <v.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wide text-zinc-900 mb-1">
                      {v.title}
                    </h3>
                    <p className="text-zinc-500 text-[13px] leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it works, honest version */}
        <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white mb-14">
          <CardContent className="p-8 space-y-4">
            <h2 className="font-black text-lg uppercase italic tracking-tight text-zinc-900">
              How VidiFlow actually works
            </h2>
            <p className="text-zinc-500 text-[14px] leading-relaxed">
              Each tool only works with content you point it at directly —
              public posts, pins, clips and videos you have a link to. We
              don't crawl platforms, scrape accounts, or get around private
              or restricted content. When you paste a link, our server fetches
              the public media, hands it back to your browser, and doesn't
              keep a copy. No account, no history, no profile being built on
              what you've downloaded.
            </p>
            <p className="text-zinc-500 text-[14px] leading-relaxed">
              VidiFlow isn't affiliated with TikTok, YouTube, Instagram,
              Pinterest, Snapchat, Twitter/X, LinkedIn, Twitch, Reddit or
              Facebook. Those are trademarks of their respective owners, and
              VidiFlow is simply an independent tool that interacts with
              public content on those platforms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="p-6 bg-zinc-900 rounded-[24px] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <MailIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white">
                Questions, bugs, or a tool you wish existed?
              </p>
              <p className="text-zinc-500 text-[11px]">
                We read every email ourselves.
              </p>
            </div>
          </div>
          <a
            href="mailto:hello@vidiflow.co"
            className="inline-flex items-center justify-center h-11 px-6 bg-white text-zinc-900 rounded-xl font-bold uppercase text-[11px] tracking-widest shrink-0"
          >
            hello@vidiflow.co
          </a>
        </div>
      </main>
      <CreatorFooter />
    </div>
  );
};

export default AboutPage;