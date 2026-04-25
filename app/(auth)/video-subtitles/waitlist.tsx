"use client";

import * as React from "react";
import Link from "next/link";
import {
  SubtitlesIcon,
  ArrowRightIcon,
  CheckCircle2,
  Loader2,
  MailIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

export default function SubtitlesWaitlist() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tool: "video-subtitles" }),
      });
      if (!res.ok) throw new Error("Failed to join waitlist");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:py-12 antialiased">
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
                AI Powered · Coming Soon
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

        {/* Waitlist Card */}
        <div className="flex items-center justify-center min-h-[460px]">
          <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl p-10 max-w-md w-full relative overflow-hidden">
            <div className="absolute -top-14 -right-14 w-48 h-48 bg-emerald-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/6 rounded-full pointer-events-none" />

            <div className="relative z-10 w-16 h-16 bg-emerald-500 rounded-[20px] flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
              <SubtitlesIcon className="w-7 h-7 text-white" />
            </div>

            {!submitted ? (
              <>
                <h2 className="relative z-10 text-3xl font-black tracking-tight uppercase italic text-zinc-900 mb-2">
                  Join the Waitlist<span className="text-emerald-500">.</span>
                </h2>
                <p className="relative z-10 text-sm text-zinc-500 leading-relaxed mb-6">
                  Be the first to know when the subtitle generator goes live.
                  We'll notify you instantly.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 space-y-3"
                >
                  <div className="relative">
                    <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 pl-11 pr-4 border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-[11px] font-bold uppercase">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        Notify Me <ArrowRightIcon className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative z-10 mt-6 pt-5 border-t border-zinc-100 space-y-2.5">
                  {[
                    "Unlimited subtitle generations, no cap",
                    "SRT & VTT export — works everywhere",
                    "Millisecond-accurate timecodes",
                    "Download your file instantly",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[12px] text-zinc-500 font-medium">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="relative z-10 text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase italic text-zinc-900 mb-1">
                    You're In<span className="text-emerald-500">.</span>
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    We'll email{" "}
                    <span className="font-bold text-zinc-700">{email}</span> the
                    moment the subtitle generator goes live.
                  </p>
                </div>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 text-emerald-500 font-black text-[11px] uppercase tracking-widest hover:gap-3 transition-all"
                >
                  Browse other tools <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <CreatorFooter />
    </div>
  );
}
