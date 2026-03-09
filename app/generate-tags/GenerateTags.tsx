"use client";

import * as React from "react";
import {
  CopyIcon,
  Loader2,
  CheckIcon,
  SparklesIcon,
  RotateCcwIcon,
  ZapIcon,
  TrendingUpIcon,
  MousePointer2Icon,
  HashIcon,
  ArrowRightIcon,
  TerminalIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

export default function EnhancedTagGenerator() {
  const [topic, setTopic] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [aiTags, setAiTags] = React.useState<string[]>([]);
  const [hashtags, setHashtags] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedType, setCopiedType] = React.useState<
    "tags" | "hashes" | "ai" | null
  >(null);

  const generateResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/generate-tags?q=${encodeURIComponent(topic)}`,
      );
      const data = await response.json();

      const cleanSubject = topic
        .replace(/how to|instantly|tutorial|2026/gi, "")
        .trim();
      const tagVariations = [
        `how to ${cleanSubject}`,
        `${cleanSubject} tutorial`,
        `${cleanSubject} 2026`,
        `best ${cleanSubject} tips`,
        `mastering ${cleanSubject}`,
        `viral ${cleanSubject} strategy`,
        `${cleanSubject} for beginners`,
        `why ${cleanSubject} is better`,
      ];

      const generatedHashes = [
        `#${cleanSubject.replace(/\s+/g, "")}`,
        `#Viral`,
        `#YouTubeSEO`,
        `#Trending`,
      ];

      setTags(
        Array.from(
          new Set([...tagVariations, ...tagVariations.map((v) => `easy ${v}`)]),
        ),
      );
      setAiTags(data.tags || []);
      setHashtags(Array.from(new Set(generatedHashes)));
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string, type: "tags" | "hashes" | "ai") => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const resetAll = () => {
    setTopic("");
    setTags([]);
    setAiTags([]);
    setHashtags([]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-100 font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-16 antialiased">
        {/* HERO HEADER */}
        <div className="flex flex-col items-center text-center mb-12">
          <Badge className="mb-4 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            SEO Engine v4.0
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 italic uppercase sm:text-6xl">
            Viral<span className="text-red-600">Tags.</span>
          </h1>
          <p className="mt-4 text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">
            Optimized for the 2026 YouTube Algorithm
          </p>
        </div>

        {/* SEARCH CONSOLE */}
        <div className="max-w-3xl mx-auto mb-20">
          <form onSubmit={generateResults} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-[30px] blur opacity-15 group-focus-within:opacity-30 transition duration-1000"></div>
            <Card className="relative flex items-center gap-3 p-6 rounded-[26px] border-zinc-100 shadow-2xl shadow-zinc-200/50 bg-white">
              {/* <div className="pl-4">
                <TerminalIcon className="h-5 w-5 text-zinc-400" />
              </div> */}
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

        {tags.length > 0 ? (
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
                  onClick={() => copyToClipboard(tags.join(", "), "tags")}
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

            {/* AI TAGS SECTION */}
            {aiTags.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                    <SparklesIcon className="h-4 w-4 text-white fill-white/20" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">
                    Machine Learning Tags
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

            {/* STANDARD TAGS GRID */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-zinc-100 rounded-xl flex items-center justify-center">
                  <TrendingUpIcon className="h-4 w-4 text-zinc-900" />
                </div>
                <h2 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">
                  Semantic Variations
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <div
                    key={i}
                    className="bg-white border border-zinc-200 px-4 py-3 rounded-xl hover:bg-zinc-50 transition-colors flex items-center gap-3"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
      {/* <CreatorFooter /> */}
    </div>
  );
}
