"use client";
import * as React from "react";
import { FormEvent } from "react";
import {
  DownloadIcon,
  Loader2,
  RotateCcwIcon,
  ZapIcon,
  Link2Icon,
  AlertCircleIcon,
  BriefcaseIcon,
  UserIcon,
  VideoIcon,
  ImageIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

interface VideoFormat {
  url: string;
  label?: string;
  quality?: string;
}

interface LinkedInResult {
  type: "video" | "image";
  title?: string;
  author?: string;
  thumbnail?: string;
  videoUrl?: string;
  imageUrl?: string;
  images?: string[];
  formats?: VideoFormat[];
}

export default function LinkedInDownloader() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<LinkedInResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = React.useState(0);

  const handleFetch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setCarouselIndex(0);
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
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (
    fileUrl: string,
    label: string,
    ext: string = "mp4",
  ) => {
    if (downloading) return;
    setDownloading(label);
    const safeFilename =
      (result?.title || "linkedin")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .substring(0, 60) || "LISave";
    try {
      const proxyUrl = `/api/linkedin-proxy?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(safeFilename)}&type=${ext === "mp4" ? "video" : "image"}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = `${safeFilename}.${ext}`;
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
      link.download = `${safeFilename}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      window.open(fileUrl, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  const reset = () => {
    setResult(null);
    setUrl("");
    setError(null);
    setCarouselIndex(0);
  };

  const isVideo = result?.type === "video";
  const isImage = result?.type === "image";
  const images = result?.images || (result?.imageUrl ? [result.imageUrl] : []);
  const isCarousel = images.length > 1;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600">
                  <span className="text-white font-black text-[9px] leading-none">
                    in
                  </span>
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  LinkedIn Tool v2.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-blue-600 animate-pulse" />
                Videos &amp; Images
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Linked
              <span className="relative inline-block">
                <span className="text-blue-600">Rip.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Download LinkedIn videos, images, and carousels in full quality —
              MP4, JPG, no login needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "HD", label: "Quality" },
              { value: "MP4", label: "Videos" },
              { value: "JPG", label: "Images" },
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
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
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
                        <DownloadIcon className="h-3.5 w-3.5" /> Get Media
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

            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Supported Content
                </span>
              </div>
              {[
                {
                  icon: <VideoIcon className="h-3 w-3" />,
                  label: "Post Videos",
                  desc: "HD MP4 download",
                },
                {
                  icon: <ImageIcon className="h-3 w-3" />,
                  label: "Post Images",
                  desc: "Single & carousel photos",
                },
                {
                  icon: <BriefcaseIcon className="h-3 w-3" />,
                  label: "Company Posts",
                  desc: "Public company content",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="text-blue-400 shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-white text-[11px] font-bold leading-none">
                      {item.label}
                    </p>
                    <p className="text-zinc-500 text-[10px]">{item.desc}</p>
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
                      Paste a public LinkedIn post to download its video or
                      images.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group shrink-0">
                      {isVideo && (
                        <>
                          {result.thumbnail ? (
                            <>
                              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-blue-300 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                              <img
                                src={result.thumbnail}
                                alt="thumbnail"
                                className="relative w-48 h-32 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                              <div className="absolute inset-0 rounded-[20px] flex items-center justify-center">
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
                              <VideoIcon className="h-12 w-12 text-blue-200" />
                            </div>
                          )}
                        </>
                      )}
                      {isImage && images.length > 0 && (
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-blue-300 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                          <img
                            src={images[carouselIndex]}
                            alt={`Image ${carouselIndex + 1}`}
                            className="relative w-48 h-48 object-cover rounded-[20px] shadow-2xl border-4 border-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          {isCarousel && (
                            <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  setCarouselIndex((i) => Math.max(0, i - 1))
                                }
                                disabled={carouselIndex === 0}
                                className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow disabled:opacity-30"
                              >
                                <ChevronLeftIcon className="h-3 w-3 text-zinc-700" />
                              </button>
                              <span className="text-[9px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                                {carouselIndex + 1}/{images.length}
                              </span>
                              <button
                                onClick={() =>
                                  setCarouselIndex((i) =>
                                    Math.min(images.length - 1, i + 1),
                                  )
                                }
                                disabled={carouselIndex === images.length - 1}
                                className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow disabled:opacity-30"
                              >
                                <ChevronRightIcon className="h-3 w-3 text-zinc-700" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-5 text-center md:text-left w-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                          <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] uppercase font-bold px-3">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            {isVideo
                              ? "Video"
                              : isCarousel
                                ? `${images.length} Images`
                                : "Image"}{" "}
                            Found
                          </Badge>
                          <span
                            className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${isVideo ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                          >
                            {isVideo ? "🎬 MP4" : "🖼️ JPG"}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase italic leading-tight line-clamp-2">
                          {result.title || "LinkedIn Post"}
                        </h3>
                        {result.author && (
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                            <UserIcon className="h-3 w-3" /> {result.author}
                          </p>
                        )}
                      </div>

                      {isVideo && (
                        <div className="space-y-2.5 pt-2">
                          {result.formats?.map((fmt, i) => (
                            <Button
                              key={i}
                              onClick={() =>
                                handleDownload(
                                  fmt.url,
                                  fmt.label || fmt.quality || "video",
                                  "mp4",
                                )
                              }
                              disabled={!!downloading}
                              className={`w-full flex items-center justify-center gap-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                                i === 0
                                  ? "h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
                                  : "h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                              }`}
                            >
                              {downloading === (fmt.label || fmt.quality) ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <>
                                  <DownloadIcon
                                    className={
                                      i === 0 ? "h-4 w-4" : "h-3.5 w-3.5"
                                    }
                                  />{" "}
                                  {fmt.label || fmt.quality}
                                </>
                              )}
                            </Button>
                          ))}
                        </div>
                      )}

                      {isImage && (
                        <div className="space-y-2.5 pt-2">
                          <Button
                            onClick={() =>
                              handleDownload(
                                images[carouselIndex],
                                `image-${carouselIndex + 1}`,
                                "jpg",
                              )
                            }
                            disabled={!!downloading}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                          >
                            {downloading === `image-${carouselIndex + 1}` ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              <>
                                <DownloadIcon className="h-4 w-4" />{" "}
                                {isCarousel
                                  ? `Download Image ${carouselIndex + 1}`
                                  : "Download Image"}
                              </>
                            )}
                          </Button>
                          {isCarousel && (
                            <Button
                              onClick={async () => {
                                for (let i = 0; i < images.length; i++) {
                                  await handleDownload(
                                    images[i],
                                    `image-all-${i + 1}`,
                                    "jpg",
                                  );
                                  await new Promise((r) => setTimeout(r, 600));
                                }
                              }}
                              disabled={!!downloading}
                              variant="outline"
                              className="w-full h-12 border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-2xl font-bold uppercase text-[11px] tracking-widest"
                            >
                              {downloading?.startsWith("image-all") ? (
                                <>
                                  <Loader2 className="animate-spin h-4 w-4 mr-2" />{" "}
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <DownloadIcon className="h-3.5 w-3.5 mr-2" />{" "}
                                  Download All {images.length} Images
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}

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
    </div>
  );
}
