"use client";

import * as React from "react";
import {
  CopyIcon,
  Loader2,
  CheckIcon,
  RotateCcwIcon,
  MusicIcon,
  ZapIcon,
  DownloadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CreatorFooter from "@/components/footer";
import Navbar from "@/components/navbar";

export default function AudioArchitect() {
  const [ytUrl, setYtUrl] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleReload = () => {
    setYtUrl("");
    setOutput("");
  };

  const handleDownloadAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl) return;
    setIsLoading(true);
    setOutput("Bypassing security and preparing audio...");

    try {
      // 1. Get the stream URL from your Next.js API (which talks to Render)
      const res = await fetch(`/api/download?url=${encodeURIComponent(ytUrl)}`);
      const data = await res.json();

      if (data.url) {
        // 2. Clean the filename: removes symbols that might break Windows/macOS filesystems
        const cleanTitle = data.title
          ? data.title.replace(/[^\w\s]/gi, "").trim()
          : "audio";
        const fileName = `${cleanTitle}.mp3`;

        // 3. The "Force Download" trick: Fetch the data as a blob
        // This prevents the browser from just opening the video player tab
        const blobRes = await fetch(data.url);
        if (!blobRes.ok) throw new Error("Failed to fetch audio stream");

        const blob = await blobRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // 4. Create and trigger the hidden download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // 5. Cleanup to save browser memory
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        setOutput(`[SUCCESS] "${fileName}" downloaded!`);
        console.log("Download complete for:", fileName);
      } else {
        setOutput(`[ERROR] ${data.error || "Failed to get download link"}`);
      }
    } catch (error) {
      console.error("Download Error:", error);
      setOutput(
        "[ERROR] Connection failed. The Render server might be waking up—please try one more time.",
      );
    } finally {
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
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 border-none text-[10px] font-bold uppercase rounded-full px-3"
              >
                v1.0 Audio
              </Badge>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />{" "}
                Audio Engine Online
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              Audio<span className="text-red-600">Extract.</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: INPUT CONSOLE */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200/60 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-zinc-900 mb-2">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <MusicIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    Source Configuration
                  </span>
                </div>

                <form onSubmit={handleDownloadAudio} className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                        YouTube URL
                      </label>
                      <button
                        type="button"
                        onClick={handleReload}
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <RotateCcwIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      className="h-12 border-zinc-200 rounded-xl bg-white font-medium text-zinc-900 focus:ring-0 focus:border-red-500/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !ytUrl}
                    className="w-full h-12 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <DownloadIcon className="h-3.5 w-3.5" /> Convert to MP3
                      </span>
                    )}
                  </Button>
                </form>

                <div className="pt-4 border-t border-zinc-100">
                  <p className="text-[9px] text-zinc-400 leading-relaxed uppercase font-bold tracking-tighter">
                    Extraction quality: 320kbps equivalent <br />
                    Format: MPEG-Layer 3 (.mp3)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-2">
              <div className="flex items-center gap-2 text-red-500">
                <ZapIcon className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  System Status
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                The server is currently processing requests with 0.4s latency.
                Audio streams are filtered for high-fidelity output.
              </p>
            </div>
          </div>

          {/* RIGHT: LOG/EDITOR */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="log" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-zinc-100/50 h-10 p-1 rounded-xl">
                  <TabsTrigger
                    value="log"
                    className="rounded-lg px-5 text-[11px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Process Log
                  </TabsTrigger>
                </TabsList>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-9 px-4 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase transition-all"
                  >
                    {copied ? (
                      <CheckIcon className="h-3.5 w-3.5 mr-2" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5 mr-2" />
                    )}
                    {copied ? "Copied" : "Copy History"}
                  </Button>
                )}
              </div>

              <TabsContent value="log" className="mt-0 outline-none">
                <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-2xl overflow-hidden bg-white">
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="Extraction logs will appear here after you start a download..."
                    className="min-h-[500px] border-none p-8 md:p-12 text-zinc-600 font-mono leading-relaxed text-[13px] focus-visible:ring-0 resize-none"
                  />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <CreatorFooter />
    </div>
  );
}
