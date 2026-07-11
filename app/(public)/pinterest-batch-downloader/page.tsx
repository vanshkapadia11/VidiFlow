"use client";

import * as React from "react";
import { useState } from "react";
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
  isVideo?: boolean;
  error?: string;
}

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

function isPinterestUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host.includes("pinterest.com") || host.includes("pin.it");
  } catch {
    return false;
  }
}

export default function PinterestBatchDownloader() {
  const [rawInput, setRawInput] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const parsedLinks = rawInput
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const validLinks = parsedLinks.filter(isPinterestUrl);
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

    // Sequential on purpose — avoids hammering Pinterest / your resolve API
    // all at once. Swap for limited-concurrency batching if you need speed.
    for (const job of newJobs) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "loading" } : j)),
      );
      try {
        const res = await fetch("/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: job.url }),
        });
        const data = await res.json();
        if (!res.ok || data.error)
          throw new Error(data.error || `Server error (${res.status})`);

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  status: "done",
                  downloadUrl: data.mediaUrl,
                  isVideo: data.isVideo,
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
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(j.downloadUrl!)}`;
          const res = await fetch(proxyUrl);
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const ext = j.isVideo
            ? "mp4"
            : blob.type.includes("png")
              ? "png"
              : "jpg";
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `PinSave-${Date.now()}-${i}.${ext}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
        }, i * 500);
      });
  };

  const reset = () => {
    setRawInput("");
    setJobs([]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />
      <Breadcrumbs
        items={[
          { name: "Downloaders", href: "/explore-tools" },
          {
            name: "Pinterest Batch Downloader",
            href: "/pinterest-batch-downloader",
          },
        ]}
      />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* ─── HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #e60023, #ad081b)",
                  }}
                >
                  <PinterestIcon className="w-2.5 h-2.5 fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  PinSave Batch
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                Multiple Pins at Once
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Pin
              <span className="relative inline-block">
                <span className="text-red-600">Batch.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#e60023"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Paste multiple Pinterest links, one per line — download every
              image and video together, in original quality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "20", label: "Max Links" },
              { value: "4K", label: "Max Quality" },
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
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #e60023, #ad081b)",
                    }}
                  >
                    <PinterestIcon className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    Pinterest Batch Downloader
                  </span>
                </div>

                <form onSubmit={handleFetchAll} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-4 w-4" /> Paste Pin Links — One
                      Per Line
                    </label>
                    <Textarea
                      placeholder={
                        "https://pinterest.com/pin/123...\nhttps://pin.it/abc123...."
                      }
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      rows={10}
                      className="border-zinc-200 rounded-xl bg-zinc-50/50 font-medium text-xs focus-visible:ring-red-500/20 focus-visible:border-red-500/50 transition-all resize-none"
                    />
                    {parsedLinks.length > 0 && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                        {validLinks.length} valid
                        {invalidCount > 0
                          ? ` · ${invalidCount} not Pinterest links`
                          : ""}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || validLinks.length === 0}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-zinc-200"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <ArrowDownToLineIcon className="h-3.5 w-3.5" />
                        Fetch{" "}
                        {validLinks.length > 0 ? `${validLinks.length} ` : ""}
                        Pin{validLinks.length !== 1 ? "s" : ""}
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

            <div className="p-5 bg-zinc-900 rounded-[24px] text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-red-400">
                <ZapIcon className="h-3.5 w-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  How Batch Mode Works
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: "📋",
                    label: "Paste Multiple",
                    desc: "One pin link per line",
                  },
                  {
                    icon: "🖼️",
                    label: "Images & Video",
                    desc: "Both types supported",
                  },
                  {
                    icon: "⚡",
                    label: "Sequential Fetch",
                    desc: "Processed one by one",
                  },
                  {
                    icon: "📦",
                    label: "Download All",
                    desc: "One click, all files",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-white text-[11px] font-bold leading-none">
                        {item.label}
                      </p>
                      <p className="text-zinc-500 text-[10px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  ⚠️ Only <span className="text-red-400 font-bold">public</span>{" "}
                  pins can be downloaded.
                </p>
              </div>
            </div>
          </div>

          {/* ─── RESULTS ─────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[520px] flex flex-col transition-all">
              {jobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center -rotate-6 border border-red-100">
                      <PinterestIcon className="w-12 h-12 fill-red-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                      <LayersIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting Pin Links
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[240px] leading-relaxed lowercase italic">
                      Paste multiple pin links on the left to fetch them all at
                      once.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase font-black px-3 py-1">
                        <CheckCircle2Icon className="h-3 w-3 mr-1" />
                        {doneCount} Ready
                      </Badge>
                      {errorCount > 0 && (
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none uppercase font-black px-3 py-1">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          {errorCount} Failed
                        </Badge>
                      )}
                    </div>

                    {doneCount > 1 && (
                      <Button
                        onClick={handleDownloadAll}
                        className="h-10 px-5 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, #e60023, #ad081b)",
                        }}
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
                              <Badge
                                className={`rounded-md px-2 py-0 text-[9px] font-black tracking-wide uppercase mb-1 border-none ${
                                  job.isVideo
                                    ? "bg-red-50 text-red-600"
                                    : "bg-orange-50 text-orange-600"
                                }`}
                              >
                                {job.isVideo ? "🎬 MP4" : "🖼️ Image"}
                              </Badge>
                            )}
                            <p className="text-xs font-bold text-zinc-700 truncate">
                              {job.status === "error" ? job.error : job.url}
                            </p>
                          </div>
                        </div>

                        {job.status === "done" && job.downloadUrl && (
                          <a
                            href={`/api/proxy?url=${encodeURIComponent(job.downloadUrl)}`}
                            download
                            className="shrink-0 h-9 w-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:text-white text-zinc-400 transition-all"
                            style={
                              {
                                // hover handled via inline for brand gradient on hover
                              }
                            }
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #e60023, #ad081b)";
                              e.currentTarget.style.borderColor = "#e60023";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "";
                              e.currentTarget.style.borderColor = "";
                            }}
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
                        Failed pins are usually private, deleted, or copied
                        incorrectly. Double check and try again.
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
