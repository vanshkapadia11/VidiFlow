// app/components/AdScript.tsx
"use client";
import { useEffect } from "react";

export default function AdScript() {
  useEffect(() => {
    let loaded = false;

    const loadAds = () => {
      if (loaded) return;
      loaded = true;

      const script = document.createElement("script");
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9027923218074479";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    // Fires on first real user interaction
    window.addEventListener("scroll", loadAds, { once: true });
    window.addEventListener("click", loadAds, { once: true });
    window.addEventListener("touchstart", loadAds, { once: true });

    // Fallback — load after 7s if user never interacts
    const fallback = setTimeout(loadAds, 7000);

    return () => {
      window.removeEventListener("scroll", loadAds);
      window.removeEventListener("click", loadAds);
      window.removeEventListener("touchstart", loadAds);
      clearTimeout(fallback);
    };
  }, []);

  return null;
}
