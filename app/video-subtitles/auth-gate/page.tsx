"use client";

import {
  SubtitlesIcon,
  CheckCircle2,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

export default function SubtitlesAuthGate() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12">
        {/* ── HEADER — matches main subtitles page exactly ── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  VidiFlow AI
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                AI Powered · Pro
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
              Sub
              <span className="relative inline-block">
                <span className="text-emerald-500">titles.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q25 2 50 4 Q75 6 98 2"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-500 font-medium text-base leading-relaxed">
              Generate subtitles for any public YouTube video — SRT & VTT, 99
              languages, millisecond-accurate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "SRT", label: "Format" },
              { value: "VTT", label: "Format" },
              { value: "99", label: "Languages" },
              { value: "Pro", label: "Feature" },
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

        {/* Gate Card */}
        <div className="flex items-center justify-center min-h-[460px]">
          <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl p-10 max-w-md w-full relative overflow-hidden">
            <div className="absolute -top-14 -right-14 w-48 h-48 bg-emerald-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/6 rounded-full pointer-events-none" />

            <div className="relative z-10 w-16 h-16 bg-emerald-500 rounded-[20px] flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
              <SubtitlesIcon className="w-7 h-7 text-white" />
            </div>

            <h2 className="relative z-10 text-3xl font-black tracking-tight uppercase italic text-zinc-900 mb-2">
              Login Required<span className="text-emerald-500">.</span>
            </h2>
            <p className="relative z-10 text-sm text-zinc-500 leading-relaxed mb-6">
              Sign in to generate SRT & VTT subtitle files from any YouTube
              video — AI-powered, 99 languages, instant download.
            </p>

            <div className="relative z-10 flex flex-wrap gap-1.5 mb-6">
              {["99 Languages", "AI Powered", "SRT & VTT", "Any Length"].map(
                (tag, i) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      i < 2
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>

            <div className="relative z-10 bg-zinc-50 rounded-[16px] p-4 mb-6 space-y-2.5">
              {[
                "Unlimited subtitle generations, no cap",
                "Auto language detection across 99 languages",
                "AssemblyAI Universal-2 accuracy",
                "Download as .srt or .vtt file",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[12px] text-zinc-600 font-medium">
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 space-y-2.5">
              <button
                onClick={() =>
                  router.push("/sign-in?redirect_url=/video-subtitles")
                }
                className="w-full h-[50px] bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-[14px] font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <LogInIcon className="h-4 w-4" />
                Sign In to Continue
              </button>

              <button
                onClick={() =>
                  router.push("/sign-up?redirect_url=/video-subtitles")
                }
                className="w-full h-[50px] bg-transparent hover:bg-emerald-50 hover:border-emerald-400 active:scale-[0.98] text-zinc-600 hover:text-emerald-600 border-[1.5px] border-zinc-200 rounded-[14px] font-bold uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Create Free Account
              </button>
            </div>

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
                  router.push("/sign-in?redirect_url=/video-subtitles")
                }
                className="text-emerald-500 font-bold hover:underline underline-offset-2"
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
