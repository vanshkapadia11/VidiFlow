import { SignIn } from "@clerk/nextjs";
import {
  MicIcon,
  DownloadIcon,
  GlobeIcon,
  ZapIcon,
  CheckCircle2,
  YoutubeIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";

const features = [
  {
    icon: MicIcon,
    label: "AI Transcription",
    desc: "Whisper-powered accuracy in 99 languages",
  },
  {
    icon: YoutubeIcon,
    label: "YouTube Support",
    desc: "Any public YouTube video, instantly",
  },
  {
    icon: DownloadIcon,
    label: "Export as TXT",
    desc: "Download your full transcript anytime",
  },
  {
    icon: GlobeIcon,
    label: "99 Languages",
    desc: "Auto language detection built-in",
  },
  {
    icon: ZapIcon,
    label: "Tag Master",
    desc: "Generate YouTube tags in seconds",
  },
];

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                VidiFlow AI · Creator Suite
              </p>
              <h1 className="text-5xl font-black tracking-tight uppercase italic leading-none">
                Welcome<span className="text-red-600">.</span>
                <br />
                <span className="text-zinc-300">Back.</span>
              </h1>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                Sign in to access your full AI-powered creator toolkit —
                transcribe, download, tag, and analyse any video in seconds.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2.5">
              {features.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-zinc-200/60 shadow-sm"
                >
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-zinc-800">
                      {label}
                    </p>
                    <p className="text-[11px] text-zinc-400">{desc}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-2xl text-white">
              <div className="flex -space-x-2">
                {["🧑‍💻", "👩‍🎤", "🧑‍🏫"].map((e, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs"
                  >
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400">
                <span className="text-white font-bold">2,400+ creators</span>{" "}
                trust VidiFlow every day
              </p>
            </div>
          </div>

          {/* Right — Clerk */}
          <div className="flex flex-col items-center justify-center">
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: "#dc2626",
                  colorBackground: "#ffffff",
                  colorText: "#18181b",
                  colorInputBackground: "#f4f4f5",
                  colorTextSecondary: "#71717a",
                  borderRadius: "14px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-xl border border-zinc-200/60 rounded-[28px] p-8 w-full",
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
