"use client";

import * as React from "react";
import {
  PlusIcon,
  MinusIcon,
  ZapIcon,
  CheckIcon,
  StarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreatorFooter from "./footer";

interface Step {
  number: string;
  title: string;
  desc: string;
}

interface Feature {
  icon: string;
  text: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface PageContentProps {
  description: string;
  steps: Step[];
  features: Feature[];
  faqs: FAQ[];
}

// ── FAQ Item ───────────────────────────────────────────────────────────────

function FAQItem({ q, a, index }: FAQ & { index: number }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      className={`border border-zinc-100 rounded-2xl overflow-hidden transition-all duration-200 ${open ? "bg-white shadow-sm" : "bg-white hover:border-zinc-200"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-6 group"
      >
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black tabular-nums text-zinc-300 tracking-widest shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-black text-zinc-800 group-hover:text-red-600 transition-colors uppercase tracking-tight leading-snug">
            {q}
          </span>
        </div>
        <div
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
            open
              ? "bg-red-600 border-red-600 rotate-180"
              : "border-zinc-200 group-hover:border-zinc-400"
          }`}
        >
          {open ? (
            <MinusIcon className="h-3 w-3 text-white" />
          ) : (
            <PlusIcon className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-48" : "max-h-0"}`}
      >
        <p className="text-zinc-500 text-sm leading-relaxed px-5 pb-5 pl-[52px]">
          {a}
        </p>
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center text-center mb-10">
      <Badge className="mb-4 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase">
        {eyebrow}
      </Badge>
      <h2 className="text-4xl font-black tracking-tighter text-zinc-900 italic uppercase sm:text-5xl">
        {title}
        <span className="text-red-600">{accent}</span>
      </h2>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PageContent({
  description,
  steps,
  features,
  faqs,
}: PageContentProps) {
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pb-24 mt-16 space-y-28">
        {/* ── DESCRIPTION ── */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-zinc-500 font-medium text-md italic leading-loose">
            {description}
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div>
          <SectionHeader
            eyebrow="How It Works"
            title="3 Simple "
            accent="Steps."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative bg-white border-2 border-zinc-100 rounded-[28px] p-6 hover:border-red-500 hover:scale-[1.02] transition-all duration-200 overflow-hidden shadow-sm cursor-default"
              >
                {/* Watermark */}
                <span className="absolute -bottom-3 -right-1 text-[72px] font-black text-zinc-50 leading-none select-none group-hover:text-red-50 transition-colors">
                  {step.number}
                </span>

                {/* Top row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-1.5 bg-zinc-950 text-white rounded-full px-3 py-1">
                    <ZapIcon className="h-2.5 w-2.5 text-red-500 fill-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Step {step.number}
                    </span>
                  </div>
                </div>

                <h3 className="font-black text-zinc-900 text-sm uppercase tracking-tight mb-2 leading-snug relative z-10">
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div>
          <SectionHeader
            eyebrow="Why VidiFlow"
            title="Built "
            accent="Different."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white border-2 border-zinc-100 rounded-2xl px-4 py-4 flex items-center gap-3 hover:border-zinc-900 transition-all duration-200 cursor-default shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckIcon className="h-3 w-3 text-zinc-400" />
                </div>
                <span className="text-base shrink-0">{feature.icon}</span>
                <span className="text-xs font-black text-zinc-700 uppercase tracking-tight leading-tight">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div>
          <SectionHeader
            eyebrow="Got Questions?"
            title="Asked "
            accent="FAQs."
          />

          <div className="max-w-3xl mx-auto space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </div>
      <CreatorFooter />
    </>
  );
}
