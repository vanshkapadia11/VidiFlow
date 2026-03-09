"use client";

import * as React from "react";
import {
  YoutubeIcon,
  CopyIcon,
  Loader2,
  CheckIcon,
  SparklesIcon,
  RotateCcwIcon,
  LayoutIcon,
  UserCircleIcon,
  ZapIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

type GenMode = "video" | "channel";

export default function CreatorArchitect() {
  const [mode, setMode] = React.useState<GenMode>("video");
  const [topic, setTopic] = React.useState("");
  const [keywords, setKeywords] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [aiTags, setAiTags] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Clear output when switching modes so content "vanishes" as requested
  React.useEffect(() => {
    setOutput("");
    setAiTags([]);
  }, [mode]);

  const handleReload = () => {
    setTopic("");
    setKeywords("");
    setOutput("");
    setAiTags([]);
  };

  const generateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/generate-tags?q=${encodeURIComponent(topic + " " + keywords)}`,
      );
      const data = await response.json();
      setAiTags(data.tags || []);

      setTimeout(() => {
        const structuralTemplate =
          mode === "video"
            ? `[STRATEGY: ${topic.toUpperCase()}]\n\n` +
              `🎯 THE HOOK\n[Visual: Start with a 3-second result montage]\n\n` +
              `📖 DESCRIPTION\nIn this video, we're mastering ${topic}. Focus on ${keywords || "the fundamentals"} for 2026.\n\n` +
              `✅ BREAKDOWN\n• Key Strategy 01\n• Avoiding common pitfalls\n• Pro-level ${keywords || "Workflow"}\n\n` +
              `#${topic.replace(/\s+/g, "")} #CreatorArchitect`
            : `[BRAND IDENTITY]\n\n` +
              `✨ MISSION\nHelping you grow in the ${topic} space.\n\n` +
              `👥 AUDIENCE\nCreators obsessed with ${keywords || "quality"}.\n\n` +
              `💎 VALUE PROP\nUnique insights into ${topic} development.`;

        setOutput(structuralTemplate);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-sm">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
        {/* MINIMAL HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                v4.0 stable
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500" /> AI Engine
                Online
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              Architect<span className="text-red-600">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-6 text-zinc-400 border-l border-zinc-200 pl-6 hidden md:flex">
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5">
                Efficiency
              </p>
              <p className="text-sm font-bold text-zinc-600 tracking-tight">
                99.2%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5">Keywords</p>
              <p className="text-sm font-bold text-zinc-600 tracking-tight">
                Optimized
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: CONSOLE */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                  <button
                    onClick={() => setMode("video")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase transition-all ${mode === "video" ? "bg-white shadow-sm text-red-600" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    <LayoutIcon className="h-3.5 w-3.5" /> Video
                  </button>
                  <button
                    onClick={() => setMode("channel")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase transition-all ${mode === "channel" ? "bg-white shadow-sm text-red-600" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    <UserCircleIcon className="h-3.5 w-3.5" /> Channel
                  </button>
                </div>

                <form onSubmit={generateContent} className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                        Subject
                      </label>
                      <button
                        type="button"
                        onClick={handleReload}
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                        title="Reload Inputs"
                      >
                        <RotateCcwIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      placeholder="e.g. Minimalist Design"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-white font-medium text-zinc-900 focus:ring-0 focus:border-red-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      Focus
                    </label>
                    <Input
                      placeholder="Keywords..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-white font-medium"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Build Structure"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {aiTags.length > 0 && (
              <div className="p-2 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <SparklesIcon className="h-3 w-3 text-red-500" /> AI
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aiTags.slice(0, 6).map((tag, i) => (
                    <span
                      key={i}
                      className="bg-white border border-zinc-200 text-zinc-500 text-[10px] font-medium py-1 px-3 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: EDITOR */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="editor" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-zinc-100/50 h-10 p-1 rounded-xl">
                  <TabsTrigger
                    value="editor"
                    className="rounded-lg px-5 text-[11px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="rounded-lg px-5 text-[11px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>

                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-9 px-4 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase"
                  >
                    {copied ? (
                      <CheckIcon className="h-3.5 w-3.5 mr-2" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5 mr-2" />
                    )}
                    {copied ? "Done" : "Copy"}
                  </Button>
                )}
              </div>

              <TabsContent value="editor" className="mt-0 outline-none">
                <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-2xl overflow-hidden bg-white">
                  <Textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="The Architect is ready for your blueprint..."
                    className="min-h-[500px] border-none p-8 md:p-12 text-zinc-700 leading-relaxed text-sm focus-visible:ring-0 resize-none font-medium"
                  />
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-0 outline-none">
                <div className="bg-white border border-zinc-200 rounded-2xl p-10 min-h-[500px] flex items-center justify-center">
                  <div className="max-w-md w-full space-y-6 border-l-2 border-red-500 pl-8">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em]">
                      Live Draft
                    </p>
                    <div className="space-y-4">
                      <div className="h-2 w-1/3 bg-zinc-100 rounded" />
                      <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap italic">
                        {output || "Awaiting architectural input..."}
                      </p>
                      <div className="h-2 w-1/2 bg-zinc-50 rounded" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      {/* <CreatorFooter /> */}
    </div>
  );
}
