import { SignUp } from "@clerk/nextjs";
import {
  MicIcon,
  DownloadIcon,
  GlobeIcon,
  ZapIcon,
  CheckCircle2,
  GiftIcon,
  FileTextIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

const perks = [
  {
    icon: GiftIcon,
    label: "Free to Start",
    desc: "No credit card required to sign up",
  },
  {
    icon: MicIcon,
    label: "AI Transcription",
    desc: "Whisper-powered, 99-language support",
  },
  {
    icon: ZapIcon,
    label: "Tag Master",
    desc: "Generate YouTube tags instantly",
  },
  {
    icon: FileTextIcon,
    label: "Desc Grabber",
    desc: "AI video descriptions in one click",
  },
  {
    icon: DownloadIcon,
    label: "TXT Export",
    desc: "Download transcripts instantly",
  },
  {
    icon: GlobeIcon,
    label: "Auto Language",
    desc: "Detects language automatically",
  },
];

export default function SignUpPage() {
  return (
    <div className="bg-[#fafafa] font-sans text-zinc-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                Free Account · No Credit Card
              </p>
              <h1 className="text-5xl font-black tracking-tight uppercase italic leading-none">
                Join<span className="text-red-600">.</span>
                <br />
                <span className="text-zinc-300">For Free.</span>
              </h1>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                Create your free VidiFlow account and unlock the full suite of
                AI-powered creator tools — transcription, tag generation,
                downloads and more.
              </p>
            </div>

            {/* Perks grid */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              {perks.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-zinc-200/60 shadow-sm"
                >
                  <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-zinc-800 leading-tight">
                      {label}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <p className="text-[11px] font-bold text-green-700">
                Free plan available · Upgrade anytime · Cancel anytime
              </p>
            </div>
          </div>

          {/* Right — Clerk */}
          <div className="flex flex-col items-center justify-center">
            <SignUp
              appearance={{
                variables: {
                  colorPrimary: "#dc2626",
                  colorBackground: "#ffffff",
                  colorText: "#18181b",
                  colorInputBackground: "#f4f4f5",
                  colorTextSecondary: "#71717a",
                  borderRadius: "14px",
                  fontFamily: "inherit",
                  fontSize: "13px",
                },
                elements: {
                  rootBox: "w-full max-w-md",
                  card: "shadow-xl border border-zinc-200/60 rounded-[28px] p-2 w-full",
                  headerTitle: "text-lg font-black uppercase tracking-tight",
                  headerSubtitle: "text-zinc-400 text-xs",
                  socialButtonsBlockButton:
                    "border border-zinc-200 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-50 h-11 transition-all",
                  socialButtonsBlockButtonText:
                    "font-bold text-[11px] uppercase tracking-wider",
                  formButtonPrimary:
                    "bg-red-600 hover:bg-red-700 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-200 h-12 transition-all",
                  formFieldInput:
                    "rounded-xl border-zinc-200 bg-zinc-50 h-11 text-sm transition-all",
                  formFieldLabel:
                    "text-[10px] font-bold uppercase tracking-widest text-zinc-400",
                  footerActionLink: "text-red-600 font-bold hover:underline",
                  footerActionText: "text-zinc-400 text-xs",
                  dividerLine: "bg-zinc-100",
                  dividerText:
                    "text-zinc-300 text-[10px] uppercase tracking-widest",
                },
              }}
            />
          </div>
        </div>
      </main>

      <CreatorFooter />
    </div>
  );
}
