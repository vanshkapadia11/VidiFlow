// app/api/youtube/route.js
// Calls your Render yt-dlp microservice.
// Set these in Netlify env vars:
//   YTDLP_API_URL  = https://your-service.onrender.com
//   YTDLP_API_SECRET = (copy from Render dashboard after deploy)

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

async function getMetadata(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {
        headers: { "User-Agent": CHROME_UA },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (res.ok) {
      const d = await res.json();
      return {
        title: d.title || "",
        author: d.author_name || "",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 0,
      };
    }
  } catch {}
  return {
    title: "",
    author: "",
    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    duration: 0,
  };
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string")
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    url = url.trim();

    // Resolve short links like youtu.be/ID?si=...
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
        { error: "Invalid YouTube URL — could not find video ID." },
        { status: 400 },
      );

    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("[YTSave] Video ID:", videoId);

    // ── STRATEGY A: yt-dlp Render microservice (primary) ──────────────────
    if (YTDLP_URL) {
      try {
        console.log("[YTSave] Calling yt-dlp service:", YTDLP_URL);
        const r = await fetch(`${YTDLP_URL}/info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-secret": YTDLP_SECRET,
          },
          body: JSON.stringify({ url: cleanUrl }),
          signal: AbortSignal.timeout(30000), // yt-dlp can take a few seconds
        });

        const d = await r.json();

        if (r.ok && d.success && d.formats?.length > 0) {
          console.log(
            "[YTSave] ✅ yt-dlp service success:",
            d.formats.length,
            "formats",
          );
          return NextResponse.json(d);
        }

        if (d.error) {
          console.warn("[YTSave] yt-dlp service error:", d.error);
          // Surface meaningful errors directly (private video, age restricted etc)
          if (
            d.error.includes("private") ||
            d.error.includes("age") ||
            d.error.includes("not available")
          ) {
            return NextResponse.json({ error: d.error }, { status: 403 });
          }
        }
      } catch (e) {
        // Service may be sleeping (Render free tier spins down after 15min)
        // First request after sleep takes ~30s — the timeout above handles this
        console.error("[YTSave] yt-dlp service failed:", e.message);
      }
    } else {
      console.warn("[YTSave] YTDLP_API_URL not set — skipping yt-dlp service");
    }

    // ── STRATEGY B: RapidAPI yt-api (fallback if Render is down) ──────────
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    if (RAPIDAPI_KEY) {
      try {
        console.log("[YTSave] Trying RapidAPI yt-api...");
        const r = await fetch(
          `https://yt-api.p.rapidapi.com/dl?id=${videoId}`,
          {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": "yt-api.p.rapidapi.com",
            },
            signal: AbortSignal.timeout(15000),
          },
        );

        if (r.ok) {
          const d = await r.json();
          if (d.status === "OK") {
            const qualityOrder = [
              "1080p",
              "720p",
              "480p",
              "360p",
              "240p",
              "144p",
            ];
            const formats = (d.formats || [])
              .filter((f) => f.url && f.mimeType?.includes("video/mp4"))
              .map((f) => ({
                quality: f.qualityLabel || "HD",
                url: f.url,
                label: `${f.qualityLabel || "HD"} MP4`,
                size: "",
              }))
              .sort(
                (a, b) =>
                  qualityOrder.indexOf(a.quality) -
                  qualityOrder.indexOf(b.quality),
              );

            if (formats.length > 0) {
              const meta = await getMetadata(videoId);
              console.log("[YTSave] ✅ RapidAPI fallback success");
              return NextResponse.json({
                videoId,
                formats,
                defaultUrl: formats[0].url,
                thumbnail: d.thumbnail?.[0]?.url || meta.thumbnail,
                title: d.title || meta.title,
                author: d.channelTitle || meta.author,
                duration: parseInt(d.lengthSeconds) || 0,
                success: true,
              });
            }
          }
        }
      } catch (e) {
        console.error("[YTSave] RapidAPI failed:", e.message);
      }
    }

    // ── STRATEGY C: Invidious (free, no key, last resort) ─────────────────
    for (const instance of [
      "https://invidious.privacyredirect.com",
      "https://inv.nadeko.net",
      "https://invidious.nerdvpn.de",
      "https://yt.artemislena.eu",
    ]) {
      try {
        console.log("[YTSave] Trying invidious:", instance);
        const r = await fetch(
          `${instance}/api/v1/videos/${videoId}?fields=title,author,lengthSeconds,videoThumbnails,formatStreams`,
          {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!r.ok) continue;
        const d = await r.json();

        const qualityOrder = ["1080p", "720p", "480p", "360p", "240p", "144p"];
        const formats = (d.formatStreams || [])
          .filter((f) => f.url && f.container === "mp4")
          .map((f) => ({
            quality: f.qualityLabel || f.quality,
            url: f.url,
            label: `${f.qualityLabel || f.quality} MP4`,
            size: "",
          }))
          .sort(
            (a, b) =>
              qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality),
          );

        if (formats.length > 0) {
          const thumb =
            d.videoThumbnails?.find((t) => t.quality === "maxresdefault")
              ?.url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
          console.log("[YTSave] ✅ Invidious success:", instance);
          return NextResponse.json({
            videoId,
            formats,
            defaultUrl: formats[0].url,
            thumbnail: thumb.startsWith("http") ? thumb : `${instance}${thumb}`,
            title: d.title || "",
            author: d.author || "",
            duration: d.lengthSeconds || 0,
            success: true,
          });
        }
      } catch (e) {
        console.error("[YTSave] Invidious failed:", instance, e.message);
      }
    }

    // ── ALL FAILED ─────────────────────────────────────────────────────────
    const meta = await getMetadata(videoId);
    return NextResponse.json(
      {
        videoId,
        formats: [],
        thumbnail: meta.thumbnail,
        title: meta.title,
        author: meta.author,
        duration: 0,
        success: false,
        error: !YTDLP_URL
          ? "YTDLP_API_URL is not configured. Deploy the yt-dlp service to Render first."
          : "Could not extract video. The yt-dlp service may be waking up — try again in 30 seconds.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[YTSave] Fatal:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
