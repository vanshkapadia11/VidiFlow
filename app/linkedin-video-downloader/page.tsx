"use client";
import * as React from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  BriefcaseIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

export default function LinkedInDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || `Server error (${res.status})`);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fmt) => {
    if (downloading) return;
    setDownloading(fmt.quality);
    const safeFilename =
      (result.title || "linkedin-video")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "LISave";
    try {
      const proxyUrl = `/api/linkedin-proxy?url=${encodeURIComponent(fmt.url)}&filename=${encodeURIComponent(safeFilename)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        const link = document.createElement("a");
        link.href = fmt.url;
        link.download = `${safeFilename}.mp4`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const blob = await res.blob();
      if (blob.size < 1000) throw new Error("File too small");
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeFilename}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      setError("Download failed: " + err.message);
    } finally {
      setDownloading(null);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-bold uppercase rounded-full px-3">
                LinkedIn Tool v1.0
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-blue-600 animate-pulse" />{" "}
                Videos &amp; Posts
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic uppercase">
              LinkedRip<span className="text-blue-600">.</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5 tracking-tighter">
                Output
              </p>
              <p className="text-sm font-bold text-zinc-600">
                MP4 · HD Quality
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  {/* LinkedIn "in" logo */}
                  <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-sm leading-none">
                      in
                    </span>
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                    LinkedIn Downloader
                  </span>
                </div>

                <form onSubmit={handleFetch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Link2Icon className="h-3 w-3" /> LinkedIn Post URL
                    </label>
                    <Input
                      placeholder="https://www.linkedin.com/posts/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-zinc-200"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <DownloadIcon className="h-3.5 w-3.5" /> Get Video
                      </span>
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info panel */}
            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              {[
                ["🎬", "Post Videos", "Public LinkedIn videos"],
                ["📢", "Company Videos", "Public company posts"],
                ["🔗", "Short Links", "lnkd.in/... auto resolved"],
              ].map(([icon, label, desc]) => (
                <div key={label} className="flex items-center gap-3">
                  <span>{icon}</span>
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
                  ⚠️ Only{" "}
                  <span className="text-blue-400 font-bold">public</span> posts
                  work. Login-required content cannot be accessed.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden bg-white min-h-[480px] flex flex-col">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center -rotate-6 border border-blue-100">
                      <BriefcaseIcon className="h-10 w-10 text-blue-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <DownloadIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                      Awaiting LinkedIn URL
                    </p>
                    <p className="text-zinc-400 text-xs max-w-[220px] leading-relaxed lowercase italic">
                      Paste a public LinkedIn post link that contains a video to
                      download it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Thumbnail */}
                    <div className="relative group shrink-0">
                      {result.thumbnail ? (
                        <>
                          <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-blue-300 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                          <img
                            src={result.thumbnail}
                            alt="thumbnail"
                            className="relative w-48 h-32 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 rounded-[20px] flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5 fill-zinc-900 ml-1"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-48 h-32 rounded-[20px] bg-blue-50 border-4 border-white shadow-2xl flex items-center justify-center">
                          <BriefcaseIcon className="h-10 w-10 text-blue-200" />
                        </div>
                      )}
                    </div>

                    {/* Info + download */}
                    <div className="flex-1 space-y-5 text-center md:text-left">
                      <div className="space-y-2">
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                          ✓ Video Found
                        </Badge>
                        <h3 className="text-xl font-black text-zinc-900 uppercase italic leading-tight line-clamp-2">
                          {result.title || "LinkedIn Video"}
                        </h3>
                        {result.author && (
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                            <UserIcon className="h-3 w-3" /> {result.author}
                          </p>
                        )}
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase">
                            🎬 MP4
                          </span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500 uppercase">
                            {result.formats?.length > 1
                              ? `${result.formats.length} Qualities`
                              : "HD Quality"}
                          </span>
                        </div>
                      </div>

                      {/* Download buttons */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Download
                        </p>
                        <div className="space-y-2">
                          {result.formats?.map((fmt, i) => (
                            <Button
                              key={i}
                              onClick={() => handleDownload(fmt)}
                              disabled={!!downloading}
                              className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                                i === 0
                                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
                                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                              }`}
                            >
                              {downloading === fmt.quality ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <>
                                  <DownloadIcon className="h-3.5 w-3.5" />{" "}
                                  {fmt.label || fmt.quality}
                                </>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={reset}
                        className="w-full text-zinc-400 hover:text-zinc-700 font-bold uppercase text-[10px] tracking-tighter"
                      >
                        <RotateCcwIcon className="mr-2 h-3 w-3" /> Download
                        Another
                      </Button>
                    </div>
                  </div>
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
