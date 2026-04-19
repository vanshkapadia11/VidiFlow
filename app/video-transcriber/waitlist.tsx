"use client";

import * as React from "react";
import Link from "next/link";
import {
  MicIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircle2,
  Loader2,
  MailIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

export default function TranscriberWaitlist() {
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
        body: JSON.stringify({
          email: email.trim(),
          tool: "video-transcriber",
        }),
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
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 overflow-x-hidden">
      <Navbar />

      <main className="antialiased">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative pt-16 pb-20 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-100/40 blur-[140px] rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-purple-100/30 blur-[100px] rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-40 left-0 w-[250px] h-[250px] bg-violet-100/20 blur-[100px] rounded-full -z-0 pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-600">
                  <SparklesIcon className="h-2.5 w-2.5 text-white fill-white" />
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  VidiFlow AI · Coming Soon
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-[clamp(3rem,9vw,6.5rem)] font-[1000] tracking-tighter uppercase italic leading-[0.88] text-zinc-900">
                Video{" "}
                <span className="relative inline-block">
                  <span className="text-violet-600">Transcribe.</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 280 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6 Q70 2 140 4 Q210 6 278 2"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                  </svg>
                </span>
              </h1>
              <p className="max-w-lg mx-auto text-zinc-500 font-medium text-lg leading-relaxed">
                AI-powered transcription for any YouTube video. 99 languages,
                timestamped output, instant download.
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12">
              {[
                { value: "99", label: "Languages" },
                { value: "AI", label: "Powered" },
                { value: "TXT", label: "Export" },
                { value: "Pro", label: "Feature" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center py-4 px-3 bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
                >
                  <span className="text-2xl font-[900] italic text-zinc-900 leading-none">
                    {s.value}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Waitlist card */}
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl p-8 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/8 rounded-full pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-500/5 rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-violet-600 rounded-[16px] flex items-center justify-center mb-5 shadow-lg shadow-violet-200">
                    <MicIcon className="w-5 h-5 text-white" />
                  </div>

                  {!submitted ? (
                    <>
                      <h2 className="text-2xl font-black tracking-tight uppercase italic text-zinc-900 mb-1">
                        Join the Waitlist
                        <span className="text-violet-600">.</span>
                      </h2>
                      <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                        Be the first to know when the transcriber goes live.
                        We'll notify you instantly.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative">
                          <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-12 pl-11 pr-4 border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10 transition-all"
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
                          className="w-full h-12 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200 active:scale-[0.98]"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              Notify Me{" "}
                              <ArrowRightIcon className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </form>

                      {/* Features */}
                      <div className="mt-6 pt-5 border-t border-zinc-100 space-y-2">
                        {[
                          "Unlimited transcriptions, no cap",
                          "Auto language detection — 99 languages",
                          "Every sentence timestamped",
                          "Download as .txt instantly",
                        ].map((f) => (
                          <div key={f} className="flex items-center gap-2.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                            <span className="text-[12px] text-zinc-500 font-medium">
                              {f}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Success state */
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto border border-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase italic text-zinc-900 mb-1">
                          You&apos;re In
                          <span className="text-violet-600">.</span>
                        </h2>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                          We&apos;ll email{" "}
                          <span className="font-bold text-zinc-700">
                            {email}
                          </span>{" "}
                          the moment the transcriber goes live.
                        </p>
                      </div>
                      <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 text-violet-600 font-black text-[11px] uppercase tracking-widest hover:gap-3 transition-all"
                      >
                        Browse other tools{" "}
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CreatorFooter />
    </div>
  );
}
