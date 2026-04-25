"use client";

import {
  MicIcon,
  ArrowRightIcon,
  CheckCircle2,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

export default function TranscriberAuthGate() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12">
        {/* Header — matches Transcriber page exactly */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase rounded-full px-3 py-1 tracking-wider">
                VidiFlow AI
              </span>
              <span className="text-zinc-300">|</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse inline-block" />
                AI Powered · Pro
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 italic uppercase">
              Transcribe<span className="text-violet-600">.</span>
            </h1>
          </div>
        </div>

        {/* Gate Card */}
        <div className="flex items-center justify-center min-h-[460px]">
          <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl p-10 max-w-md w-full relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-14 -right-14 w-48 h-48 bg-violet-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-violet-500/06 rounded-full pointer-events-none" />

            {/* Icon */}
            <div className="relative z-10 w-16 h-16 bg-violet-600 rounded-[20px] flex items-center justify-center mb-6 shadow-lg shadow-violet-200">
              <MicIcon className="w-7 h-7 text-white" />
            </div>

            {/* Title */}
            <h2 className="relative z-10 text-3xl font-black tracking-tight uppercase italic text-zinc-900 mb-2">
              Login Required<span className="text-violet-600">.</span>
            </h2>
            <p className="relative z-10 text-sm text-zinc-500 leading-relaxed mb-6">
              Sign in to convert any YouTube video to text instantly —
              AI-powered, 99 languages, unlimited transcriptions.
            </p>

            {/* Tags */}
            <div className="relative z-10 flex flex-wrap gap-1.5 mb-6">
              {["99 Languages", "AI Powered", "Export TXT", "Any Length"].map(
                (tag, i) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      i < 2
                        ? "bg-violet-100 text-violet-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>

            {/* Features */}
            <div className="relative z-10 bg-zinc-50 rounded-[16px] p-4 mb-6 space-y-2.5">
              {[
                "Unlimited transcriptions, no cap",
                "Auto language detection across 99 languages",
                "AssemblyAI Universal-2 accuracy",
                "Download transcript as .txt file",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  <span className="text-[12px] text-zinc-600 font-medium">
                    {f}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="relative z-10 space-y-2.5">
              <button
                onClick={() =>
                  router.push("/sign-in?redirect_url=/video-transcriber")
                }
                className="w-full h-[50px] bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white rounded-[14px] font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2"
              >
                <LogInIcon className="h-4 w-4" />
                Sign In to Continue
              </button>

              <button
                onClick={() =>
                  router.push("/sign-up?redirect_url=/video-transcriber")
                }
                className="w-full h-[50px] bg-transparent hover:bg-violet-50 hover:border-violet-400 active:scale-[0.98] text-zinc-600 hover:text-violet-600 border-[1.5px] border-zinc-200 rounded-[14px] font-bold uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Create Free Account
              </button>
            </div>

            {/* Divider */}
            <div className="relative z-10 flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Already subscribed?
              </span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>

            <p className="relative z-10 text-[11px] text-zinc-400 text-center">
              Have an account?{" "}
              <button
                onClick={() =>
                  router.push("/sign-in?redirect_url=/video-transcriber")
                }
                className="text-violet-500 font-bold hover:underline underline-offset-2"
              >
                Sign in here →
              </button>
            </p>
          </div>
        </div>
      </main>

      <CreatorFooter />
    </div>
  );
}
