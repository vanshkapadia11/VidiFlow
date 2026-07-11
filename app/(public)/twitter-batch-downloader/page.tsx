"use client";

import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ArrowDownToLineIcon,
  LayersIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";
import Breadcrumbs from "@/components/breadcrumbs";

type JobStatus = "pending" | "loading" | "done" | "error";

interface Job {
  id: string;
  url: string;
  status: JobStatus;
  title?: string;
  downloadUrl?: string;
  quality?: string;
  imageCount?: number;
  error?: string;
}

function isTwitterUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host.includes("twitter.com") || host.includes("x.com");
  } catch {
    return false;
  }
}

export default function TwitterBatchDownloader() {
  const [rawInput, setRawInput] = React.useState("");
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const parsedLinks = rawInput
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const validLinks = parsedLinks.filter(isTwitterUrl);
  const invalidCount = parsedLinks.length - validLinks.length;
  const doneCount = jobs.filter((j) => j.status === "done").length;
  const errorCount = jobs.filter((j) => j.status === "error").length;

  const handleFetchAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validLinks.length === 0) return;

    setIsProcessing(true);

    const newJobs: Job[] = validLinks.map((url, i) => ({
      id: `${Date.now()}-${i}`,
      url,
      status: "pending",
    }));
    setJobs(newJobs);

    // Sequential on purpose — avoids hammering X / your resolve API all at
    // once. Swap for limited-concurrency batching if you need speed.
    for (const job of newJobs) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "loading" } : j)),
      );
      try {
        const res = await fetch("/api/twitter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: job.url }),
        });
        const data = await res.json();
        if (!res.ok || data.error)
          throw new Error(data.error || `Server error (${res.status})`);

        // Prefer the best (first) video format; fall back to first image.
        const bestVideo = data.formats?.[0];
        const downloadUrl = bestVideo?.url ?? data.images?.[0];

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  status: "done",
                  title: data.title,
                  downloadUrl,
                  quality: bestVideo?.label || bestVideo?.quality,
                  imageCount: data.images?.length,
                }
              : j,
          ),
        );
      } catch (err) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: "error", error: (err as Error).message }
              : j,
          ),
        );
      }
    }

    setIsProcessing(false);
  };

  const handleDownloadAll = () => {
    jobs
      .filter((j) => j.status === "done" && j.downloadUrl)
      .forEach((j, i) => {
        setTimeout(async () => {
          const proxyUrl = `/api/twitter-proxy?url=${encodeURIComponent(j.downloadUrl!)}&filename=${encodeURIComponent(j.title || "XSave")}`;
          try {
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error("proxy failed");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const ext = blob.type.includes("image") ? "jpg" : "mp4";
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `XSave-${Date.now()}-${i}.${ext}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
          } catch {
            window.open(j.downloadUrl, "_blank");
          }
        }, i * 500);
      });
  };

  const reset = () => {
    setRawInput("");
    setJobs([]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <Breadcrumbs
        items={[
          { name: "Downloaders", href: "/explore-tools" },
          { name: "Twitter / X Batch Downloader", href: "/twitter-batch-downloader" },
        ]}
      />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* ─── HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-sky-500">
                  <span className="text-white font-black text-[9px]">𝕏</span>
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  X Rip Batch
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-sky-500 animate-pulse" />
                Multiple Posts at Once
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              X
              <span className="relative inline-block">
                <span className="text-sky-500">Batch.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#0ea5e9"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Paste multiple Twitter or X post links, one per line — download
              every video, GIF, and photo together.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "20", label: "Max Links" },
              { value: "HD", label: "Quality" },
              { value: "MP4", label: "& Images" },
              { value: "Free", label: "Forever" },
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ─── SIDEBAR ─────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-sky-500 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-sm">𝕏</span>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    X Batch Downloader
                  </span>
                </div>

                <form onSubmit={handleFetchAll} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> Paste Post Links — One
                      Per Line
                    </label>
                    <Textarea
                      placeholder={
                        "https://x.com/user/status/...\nhttps://twitter.com/user/status/...\nhttps://x.com/user/status/..."
                      }
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      rows={6}
                      className="border-zinc-200 rounded-xl bg-zinc-50/50 font-medium text-sm focus-visible:ring-sky-500/20 focus-visible:border-sky-500/50 transition-all resize-none"
                    />
                    {parsedLinks.length > 0 && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                        {validLinks.length} valid
                        {invalidCount > 0
                          ? ` · ${invalidCount} not X/Twitter links`
                          : ""}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || validLinks.length === 0}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-zinc-200"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <ArrowDownToLineIcon className="h-3.5 w-3.5" />
                        Fetch{" "}
                        {validLinks.length > 0 ? `${validLinks.length} ` : ""}
                        Post{validLinks.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </Button>

                  {jobs.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={reset}
                      className="w-full text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px]"
                    >
                      <TrashIcon className="mr-2 h-3.5 w-3.5" /> Clear All
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-sky-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  How Batch Mode Works
                </span>
              </div>
              {[
                ["📋", "Paste Multiple", "One post link per line"],
                ["🎬", "Best Quality Picked", "Highest available auto-selected"],
                ["⚡", "Sequential Fetch", "Processed one by one"],
                ["📦", "Download All", "One click, all files"],
              ].map(([icon, label, desc]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="text-white text-[11px] font-bold leading-none">
                      {label}
                    </p>
                    <p className="text-zinc-500 text-[10px]">{desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  ⚠️ Only <span className="text-sky-400 font-bold">public</span>{" "}
                  posts. Protected accounts cannot be accessed. For posts
                  with multiple photos, only the first is grabbed in batch
                  mode — use the single downloader for full sets.
                </p>
              </div>
            </div>
          </div>

          {/* ─── RESULTS ─────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              {jobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-sky-50 flex items-center justify-center rotate-6 border border-sky-100">
                      <LayersIcon className="w-11 h-11 text-sky-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                      <DownloadIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Post Links
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[240px] leading-relaxed lowercase italic">
                      Paste multiple public X or Twitter post links on the
                      left to fetch them all at once.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none uppercase font-bold px-3 py-1">
                        <CheckCircle2Icon className="h-3 w-3 mr-1" />
                        {doneCount} Ready
                      </Badge>
                      {errorCount > 0 && (
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none uppercase font-bold px-3 py-1">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          {errorCount} Failed
                        </Badge>
                      )}
                    </div>

                    {doneCount > 1 && (
                      <Button
                        onClick={handleDownloadAll}
                        className="h-10 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-sky-200"
                      >
                        <DownloadIcon className="h-3.5 w-3.5 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between gap-4 bg-zinc-50/60 border border-zinc-100 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="shrink-0 w-9 h-9 rounded-xl bg-white border border-zinc-100 flex items-center justify-center">
                            {job.status === "loading" && (
                              <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
                            )}
                            {job.status === "done" && (
                              <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                            )}
                            {job.status === "error" && (
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            )}
                            {job.status === "pending" && (
                              <Link2Icon className="h-4 w-4 text-zinc-300" />
                            )}
                          </div>

                          <div className="min-w-0">
                            {job.status === "done" && (
                              <Badge className="rounded-md px-2 py-0 text-[9px] font-black tracking-wide uppercase mb-1 border-none bg-sky-50 text-sky-600">
                                {job.quality
                                  ? `🎬 ${job.quality}`
                                  : job.imageCount
                                    ? `🖼️ ${job.imageCount} photo${job.imageCount !== 1 ? "s" : ""}`
                                    : "Media"}
                              </Badge>
                            )}
                            <p className="text-xs font-bold text-zinc-700 truncate">
                              {job.status === "error"
                                ? job.error
                                : job.title || job.url}
                            </p>
                          </div>
                        </div>

                        {job.status === "done" && job.downloadUrl && (
                          <a
                            href={`/api/twitter-proxy?url=${encodeURIComponent(job.downloadUrl)}&filename=${encodeURIComponent(job.title || "XSave")}`}
                            download
                            className="shrink-0 h-9 w-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-sky-500 hover:border-sky-500 hover:text-white text-zinc-400 transition-all"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {errorCount > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold">
                      <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        Failed posts are usually protected accounts, deleted
                        tweets, or text-only (no media). Double check and try
                        again.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <CreatorFooter />
    </div>
  );
}