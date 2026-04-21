"use client";

import * as React from "react";
import {
  Loader2,
  CheckIcon,
  SparklesIcon,
  RotateCcwIcon,
  ZapIcon,
  TrendingUpIcon,
  MousePointer2Icon,
  ArrowRightIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Top Results": <TrendingUpIcon className="h-3 w-3" />,
  "How-To": <span className="text-[10px] font-black">HT</span>,
  Tutorials: <span className="text-[10px] font-black">TU</span>,
  "Best Of": <span className="text-[10px] font-black">★</span>,
  "For Beginners": <span className="text-[10px] font-black">01</span>,
  "Tips & Tricks": <span className="text-[10px] font-black">TT</span>,
  "Trending Now": <ZapIcon className="h-3 w-3" />,
  "Why / Reasons": <span className="text-[10px] font-black">?</span>,
  Comparisons: <span className="text-[10px] font-black">VS</span>,
  "Quick & Easy": <span className="text-[10px] font-black">EZ</span>,
};

export default function EnhancedTagGenerator() {
  const [topic, setTopic] = React.useState("");
  const [aiTags, setAiTags] = React.useState<string[]>([]);
  const [categorized, setCategorized] = React.useState<
    Record<string, string[]>
  >({});
  const [hashtags, setHashtags] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedType, setCopiedType] = React.useState<"tags" | "hashes" | null>(
    null,
  );

  const generateResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/generate-tags?q=${encodeURIComponent(topic)}`,
      );
      const data = await response.json();

      setAiTags(data.tags || []);
      setCategorized(data.categorized || {});

      // Hashtags derived from top scored tags
      const topWords = (data.tags as string[]).slice(0, 6).map((t: string) =>
        t
          .split(" ")
          .map((w: string) => w[0].toUpperCase() + w.slice(1))
          .join(""),
      );
      setHashtags(
        [
          "#YouTubeSEO",
          "#Viral",
          "#Trending",
          ...topWords.map((w: string) => `#${w}`),
        ].slice(0, 8),
      );
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string, type: "tags" | "hashes") => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const resetAll = () => {
    setTopic("");
    setAiTags([]);
    setCategorized({});
    setHashtags([]);
  };

  const hasResults = aiTags.length > 0 || Object.keys(categorized).length > 0;

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-100 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-16 antialiased">
        {/* HERO HEADER */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
              </span>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                SEO Engine v4.0
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
              2026 Algorithm
            </span>
          </div>

          <h1 className="text-[clamp(3rem,9vw,7rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
            Viral
            <span className="relative inline-block">
              <span className="text-red-600">Tags.</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 120 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6 Q30 2 60 4 Q90 6 118 2"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-5 text-zinc-500 font-medium text-base leading-relaxed max-w-md">
            Generate high-ranking SEO tags using our AI engine — optimized for
            the 2026 YouTube algorithm.
          </p>

          <div className="grid grid-cols-4 gap-3 mt-8 max-w-lg w-full">
            {[
              { value: "AI", label: "Powered" },
              { value: "SEO", label: "Optimized" },
              { value: "99+", label: "Tags" },
              { value: "Free", label: "Forever" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-3 px-2 bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
              >
                <span className="text-lg font-[900] italic text-zinc-900 leading-none">
                  {s.value}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH CONSOLE */}
        <div className="max-w-3xl mx-auto mb-20">
          <form onSubmit={generateResults} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-[30px] blur opacity-15 group-focus-within:opacity-30 transition duration-1000"></div>
            <Card className="relative flex items-center gap-3 p-6 rounded-[26px] border-zinc-100 shadow-2xl shadow-zinc-200/50 bg-white">
              <Input
                placeholder="ENTER YOUR VIDEO TOPIC..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border-none bg-transparent focus-visible:ring-0 text-md h-12 font-black uppercase placeholder:text-zinc-300 placeholder:italic"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-zinc-900 text-white hover:bg-red-600 px-8 rounded-2xl h-12 font-black transition-all duration-300 uppercase text-xs tracking-widest group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Analyze{" "}
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </Card>
          </form>
        </div>

        {hasResults ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* ACTION BAR */}
            <div className="sticky top-4 z-40 flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-zinc-100 p-4 rounded-3xl shadow-xl shadow-zinc-200/20">
              <div className="flex items-center gap-4 pl-2">
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-zinc-400 uppercase leading-none">
                    Topic Analysis
                  </p>
                  <p className="text-sm font-black text-zinc-900 italic uppercase">
                    "{topic}"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => copyToClipboard(aiTags.join(", "), "tags")}
                  className={`h-11 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    copiedType === "tags"
                      ? "bg-green-500 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {copiedType === "tags" ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    "Copy All Tags"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetAll}
                  className="h-11 w-11 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <RotateCcwIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* AI / TOP SCORED TAGS */}
            {aiTags.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                    <SparklesIcon className="h-4 w-4 text-white fill-white/20" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">
                    Top Ranked Tags
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {aiTags.map((tag, i) => (
                    <div
                      key={i}
                      className="group bg-white border-2 border-zinc-100 p-4 rounded-2xl hover:border-red-500 hover:scale-[1.02] transition-all cursor-default relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZapIcon className="h-3 w-3 text-red-500 fill-red-500" />
                      </div>
                      <span className="text-[11px] font-black text-zinc-800 uppercase tracking-tight">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIZED SEARCH INTENT CLUSTERS */}
            {Object.keys(categorized).length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-zinc-100 rounded-xl flex items-center justify-center">
                    <TrendingUpIcon className="h-4 w-4 text-zinc-900" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">
                    Search Intent Clusters
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categorized).map(([category, catTags]) => (
                    <div
                      key={category}
                      className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-3 hover:border-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-zinc-100 rounded-md flex items-center justify-center text-zinc-500">
                          {CATEGORY_ICONS[category] ?? (
                            <span className="text-[9px] font-black">•</span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {category}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {catTags.map((tag, i) => (
                          <div
                            key={i}
                            className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-zinc-100 transition-colors cursor-default"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                              {tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HASHTAG FOOTER */}
            <div className="bg-zinc-900 rounded-[32px] p-8 text-center space-y-6 shadow-2xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                Suggested Hashtags
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {hashtags.map((hash, i) => (
                  <Badge
                    key={i}
                    className="bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white border-none px-6 py-2 rounded-xl font-black text-xs transition-colors cursor-pointer"
                  >
                    {hash}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => copyToClipboard(hashtags.join(" "), "hashes")}
                variant="link"
                className="text-zinc-500 hover:text-white text-[10px] uppercase font-black tracking-widest no-underline"
              >
                {copiedType === "hashes" ? "Copied!" : "Copy Hashtag String"}
              </Button>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-zinc-100 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 border border-zinc-100">
              <MousePointer2Icon className="h-10 w-10 text-zinc-200" />
            </div>
            <h3 className="text-zinc-900 font-black text-2xl uppercase italic tracking-tighter">
              Awaiting Input
            </h3>
            <p className="text-zinc-400 font-medium max-w-xs mx-auto mt-2 text-sm">
              Our algorithm is ready to scan for high-ranking keywords. Just
              tell us what you're making.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
