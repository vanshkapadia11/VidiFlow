"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Tiny standalone progress bar — no external deps needed
export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Reset
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Start: snap to 0, show, animate to 85%
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        bar.style.transition = "width 300ms ease";
        bar.style.width = "70%";

        timerRef.current = setTimeout(() => {
          bar.style.transition = "width 4000ms ease";
          bar.style.width = "90%";
        }, 300);
      });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // Complete: shoot to 100% then fade out
      bar.style.transition = "width 200ms ease";
      bar.style.width = "100%";

      setTimeout(() => {
        bar.style.transition = "opacity 300ms ease";
        bar.style.opacity = "0";
        setTimeout(() => {
          bar.style.transition = "none";
          bar.style.width = "0%";
        }, 300);
      }, 200);
    };
  }, [pathname, searchParams]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "3px",
          width: "0%",
          opacity: "0",
          background: "linear-gradient(90deg, #e60023, #ff4d6d, #e60023)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          boxShadow: "0 0 10px rgba(230, 0, 35, 0.6)",
          borderRadius: "0 2px 2px 0",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
