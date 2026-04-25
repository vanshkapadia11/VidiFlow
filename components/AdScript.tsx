// app/components/AdScript.tsx
"use client";
import { useEffect } from "react";

export default function AdScript() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const script = document.createElement("script");
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9027923218074479";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
