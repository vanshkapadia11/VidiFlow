// app/api/youtube-thumbnail/route.js
import { NextResponse } from "next/server";

function extractVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    let videoId = extractVideoId(url);

    // Follow redirects for short URLs
    if (!videoId) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        videoId = extractVideoId(res.url);
      } catch (e) {}
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL — could not find video ID." },
        { status: 400 },
      );
    }

    // Get video title via oEmbed
    let title = "";
    let author = "";
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || "";
        author = data.author_name || "";
      }
    } catch (e) {}

    // All YouTube thumbnail sizes
    // maxresdefault = 1280x720 (not always available)
    // sddefault     = 640x480
    // hqdefault     = 480x360
    // mqdefault     = 320x180
    // default       = 120x90
    const thumbnails = [
      {
        key: "maxres",
        label: "Max Resolution",
        size: "1280×720",
        url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        badge: "HD",
        badgeColor: "#ff0000",
      },
      {
        key: "sd",
        label: "SD Quality",
        size: "640×480",
        url: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
        badge: "SD",
        badgeColor: "#f97316",
      },
      {
        key: "hq",
        label: "High Quality",
        size: "480×360",
        url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        badge: "HQ",
        badgeColor: "#eab308",
      },
      {
        key: "mq",
        label: "Medium Quality",
        size: "320×180",
        url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        badge: "MQ",
        badgeColor: "#6b7280",
      },
      {
        key: "default",
        label: "Default",
        size: "120×90",
        url: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
        badge: "SM",
        badgeColor: "#6b7280",
      },
    ];

    // Check which thumbnails actually exist (maxres sometimes missing)
    const checkedThumbnails = await Promise.all(
      thumbnails.map(async (thumb) => {
        try {
          const res = await fetch(thumb.url, { method: "HEAD" });
          // YouTube returns a 120x90 placeholder for missing maxres
          // Check Content-Length — placeholder is very small (~2KB)
          const contentLength = parseInt(
            res.headers.get("content-length") || "0",
          );
          const available =
            res.ok && (thumb.key !== "maxres" || contentLength > 5000);
          return { ...thumb, available };
        } catch (e) {
          return { ...thumb, available: false };
        }
      }),
    );

    // Fallback maxres → hq if maxres not available
    const result = checkedThumbnails.map((t) => {
      if (t.key === "maxres" && !t.available) {
        return {
          ...t,
          url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          available: true,
          note: "Showing HQ (Max not available)",
        };
      }
      return t;
    });

    return NextResponse.json({
      videoId,
      title,
      author,
      thumbnails: result,
      success: true,
    });
  } catch (error) {
    console.error("[YTThumb] Error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
