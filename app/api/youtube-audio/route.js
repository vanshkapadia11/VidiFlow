// app/api/youtube-audio/route.js
// Same Render service, /audio endpoint

import { NextResponse } from "next/server";

const YTDLP_URL = (process.env.YTDLP_API_URL || "").replace(/\/$/, "");
const YTDLP_SECRET = process.env.YTDLP_API_SECRET || "";
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function extractVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string")
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    url = url.trim();
    let videoId = extractVideoId(url);

    if (!videoId) {
      try {
        const r = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": CHROME_UA },
          signal: AbortSignal.timeout(5000),
        });
        url = r.url;
        videoId = extractVideoId(r.url);
      } catch {}
    }

    if (!videoId)
      return NextResponse.json(
        { error: "Invalid YouTube URL." },
        { status: 400 },
      );

    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("[YTAudio] Video ID:", videoId);

    // ── STRATEGY A: yt-dlp Render service ─────────────────────────────────
    if (YTDLP_URL) {
      try {
        console.log("[YTAudio] Calling yt-dlp audio service...");
        const r = await fetch(`${YTDLP_URL}/audio`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-secret": YTDLP_SECRET,
          },
          body: JSON.stringify({ url: cleanUrl }),
          signal: AbortSignal.timeout(30000),
        });

        const d = await r.json();
        if (r.ok && d.success && d.audioUrl) {
          console.log("[YTAudio] ✅ yt-dlp audio success");
          return NextResponse.json(d);
        }
        if (d.error) console.warn("[YTAudio] yt-dlp error:", d.error);
      } catch (e) {
        console.error("[YTAudio] yt-dlp service failed:", e.message);
      }
    }

    // ── STRATEGY B: RapidAPI youtube-mp36 ─────────────────────────────────
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    if (RAPIDAPI_KEY) {
      try {
        console.log("[YTAudio] Trying youtube-mp36...");
        const r = await fetch(
          `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
          {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
            },
            signal: AbortSignal.timeout(15000),
          },
        );
        if (r.ok) {
          const d = await r.json();
          if (d.status === "ok" && d.link) {
            console.log("[YTAudio] ✅ youtube-mp36 success");
            return NextResponse.json({
              videoId,
              audioUrl: d.link,
              format: "mp3",
              bitrate: "128kbps",
              title: d.title || "",
              author: "",
              thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[YTAudio] youtube-mp36 failed:", e.message);
      }
    }

    // ── STRATEGY C: Invidious audio stream ────────────────────────────────
    for (const instance of [
      "https://invidious.privacyredirect.com",
      "https://inv.nadeko.net",
      "https://invidious.nerdvpn.de",
    ]) {
      try {
        const r = await fetch(
          `${instance}/api/v1/videos/${videoId}?fields=title,author,videoThumbnails,adaptiveFormats`,
          {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!r.ok) continue;
        const d = await r.json();

        const best = (d.adaptiveFormats || [])
          .filter((f) => f.type?.startsWith("audio/") && f.url)
          .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

        if (best) {
          const bitrate = best.bitrate
            ? `${Math.round(best.bitrate / 1000)}kbps`
            : "128kbps";
          const thumb =
            d.videoThumbnails?.find((t) => t.quality === "maxresdefault")
              ?.url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
          console.log("[YTAudio] ✅ Invidious audio success:", instance);
          return NextResponse.json({
            videoId,
            audioUrl: best.url,
            format: "webm",
            bitrate,
            title: d.title || "",
            author: d.author || "",
            thumbnail: thumb.startsWith("http") ? thumb : `${instance}${thumb}`,
            success: true,
          });
        }
      } catch (e) {
        console.error("[YTAudio] Invidious failed:", instance, e.message);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: !YTDLP_URL
          ? "YTDLP_API_URL not configured. Deploy yt-dlp service to Render first."
          : "Could not extract audio. Try again in 30 seconds (service may be waking up).",
      },
      { status: 404 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
