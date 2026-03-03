// app/api/youtube/route.js
import { NextResponse } from "next/server";

function extractVideoId(url) {
  // Handle all YouTube URL formats
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/, // ?v=ID or &v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/, // /v/ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/ID
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/, // full watch URL
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getYouTubeMetadata(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || "",
        author: data.author_name || "",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 0,
      };
    }
  } catch (e) {
    /* ignore */
  }
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
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[YTSave] Input URL:", url);

    // FIX: Extract video ID BEFORE resolving redirects — youtu.be has ID in path
    let videoId = extractVideoId(url);
    console.log("[YTSave] Video ID from original URL:", videoId);

    // If still no ID (e.g. short URL without ID in path), follow redirect
    if (!videoId) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const resolvedUrl = res.url;
        console.log("[YTSave] Resolved to:", resolvedUrl);
        videoId = extractVideoId(resolvedUrl);
        console.log("[YTSave] Video ID after redirect:", videoId);
      } catch (e) {
        console.error("[YTSave] Redirect failed:", e.message);
      }
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL — could not extract video ID." },
        { status: 400 },
      );
    }

    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("[YTSave] Clean URL:", cleanUrl);

    // ── STRATEGY A: cobalt.tools (updated API format for 2024/2025) ──
    try {
      console.log("[YTSave] Trying cobalt.tools...");
      const cobaltRes = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          url: cleanUrl,
          videoQuality: "720",
          audioFormat: "mp3",
          filenameStyle: "classic",
        }),
      });

      console.log("[YTSave] cobalt status:", cobaltRes.status);

      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.json();
        console.log(
          "[YTSave] cobalt response:",
          JSON.stringify(cobaltData).substring(0, 200),
        );

        const status = cobaltData.status;

        if (
          (status === "stream" ||
            status === "redirect" ||
            status === "tunnel") &&
          cobaltData.url
        ) {
          const meta = await getYouTubeMetadata(videoId);
          console.log("[YTSave] ✅ cobalt success");
          return NextResponse.json({
            videoId,
            formats: [
              { quality: "720p", url: cobaltData.url, label: "HD 720p" },
            ],
            defaultUrl: cobaltData.url,
            thumbnail: meta.thumbnail,
            title: meta.title,
            author: meta.author,
            duration: meta.duration,
            success: true,
          });
        }

        if (status === "picker" && cobaltData.picker?.length > 0) {
          const formats = cobaltData.picker.map((p, i) => ({
            quality: p.quality || `${i + 1}`,
            url: p.url,
            label: p.quality ? `${p.quality}p` : `Option ${i + 1}`,
          }));
          const meta = await getYouTubeMetadata(videoId);
          return NextResponse.json({
            videoId,
            formats,
            defaultUrl: formats[0].url,
            thumbnail: meta.thumbnail,
            title: meta.title,
            author: meta.author,
            duration: meta.duration,
            success: true,
          });
        }

        console.log(
          "[YTSave] cobalt returned non-success status:",
          status,
          cobaltData.error?.code,
        );
      }
    } catch (e) {
      console.error("[YTSave] cobalt failed:", e.message);
    }

    // ── STRATEGY B: yt5s.io API ──
    try {
      console.log("[YTSave] Trying yt5s.io...");
      const yt5Res = await fetch("https://yt5s.io/api/ajaxSearch/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://yt5s.io/",
          Origin: "https://yt5s.io",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          q: cleanUrl,
          vt: "home",
        }),
      });

      console.log("[YTSave] yt5s status:", yt5Res.status);

      if (yt5Res.ok) {
        const yt5Data = await yt5Res.json();
        console.log("[YTSave] yt5s response status:", yt5Data.status);

        if (yt5Data.status === "Ok" && yt5Data.links?.mp4) {
          const qualityOrder = [
            "1080p",
            "720p",
            "480p",
            "360p",
            "240p",
            "144p",
          ];
          const formats = [];

          for (const [q, val] of Object.entries(yt5Data.links.mp4)) {
            if (val.k && q !== "auto") {
              formats.push({
                quality: q,
                k: val.k,
                label: `${q} MP4`,
                size: val.size || "",
                needsConvert: true,
                convertApi: "yt5s",
              });
            }
          }

          formats.sort(
            (a, b) =>
              qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality),
          );

          if (formats.length > 0) {
            const meta = await getYouTubeMetadata(videoId);
            console.log("[YTSave] ✅ yt5s success, formats:", formats.length);
            return NextResponse.json({
              videoId,
              formats,
              thumbnail: yt5Data.thumbnail || meta.thumbnail,
              title: yt5Data.title || meta.title,
              author: meta.author,
              duration: meta.duration,
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[YTSave] yt5s failed:", e.message);
    }

    // ── STRATEGY C: loader.to API ──
    try {
      console.log("[YTSave] Trying loader.to...");
      const loaderRes = await fetch(
        `https://loader.to/api/button/?url=${encodeURIComponent(cleanUrl)}&f=mp4&lang=en`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://loader.to/",
          },
        },
      );

      if (loaderRes.ok) {
        const loaderData = await loaderRes.json();
        console.log(
          "[YTSave] loader.to result:",
          JSON.stringify(loaderData).substring(0, 200),
        );

        if (loaderData.id) {
          // Poll for completion
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const pollRes = await fetch(
              `https://loader.to/api/info/?format=mp4&url=${encodeURIComponent(cleanUrl)}`,
              { headers: { "User-Agent": "Mozilla/5.0" } },
            );
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              if (pollData.success && pollData.download_url) {
                const meta = await getYouTubeMetadata(videoId);
                console.log("[YTSave] ✅ loader.to success");
                return NextResponse.json({
                  videoId,
                  formats: [
                    {
                      quality: "720p",
                      url: pollData.download_url,
                      label: "HD 720p",
                    },
                  ],
                  defaultUrl: pollData.download_url,
                  thumbnail: meta.thumbnail,
                  title: meta.title,
                  author: meta.author,
                  success: true,
                });
              }
              if (pollData.progress === 100) break;
            }
          }
        }
      }
    } catch (e) {
      console.error("[YTSave] loader.to failed:", e.message);
    }

    // ── STRATEGY D: Return metadata so UI isn't blank ──
    const meta = await getYouTubeMetadata(videoId);
    console.log("[YTSave] ❌ All download strategies failed");
    return NextResponse.json(
      {
        videoId,
        formats: [],
        thumbnail: meta.thumbnail,
        title: meta.title,
        author: meta.author,
        duration: meta.duration,
        success: false,
        error:
          "Could not extract download link. YouTube may be blocking this video.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[YTSave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}

// ── PUT: Convert y2mate/yt5s format key to actual download URL ──
export async function PUT(req) {
  try {
    const { videoId, k, convertApi } = await req.json();
    if (!videoId || !k) {
      return NextResponse.json(
        { error: "videoId and k required" },
        { status: 400 },
      );
    }

    // yt5s convert
    if (convertApi === "yt5s") {
      const res = await fetch("https://yt5s.io/api/ajaxConvert/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Referer: "https://yt5s.io/",
          Origin: "https://yt5s.io",
        },
        body: new URLSearchParams({ vid: videoId, k }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "Ok" && data.dlink) {
          return NextResponse.json({ url: data.dlink });
        }
      }
    }

    // y2mate convert fallback
    const res = await fetch("https://www.y2mate.com/mates/convertV2/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.y2mate.com/",
        Origin: "https://www.y2mate.com",
      },
      body: new URLSearchParams({ vid: videoId, k }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === "Ok" && data.dlink) {
        return NextResponse.json({ url: data.dlink });
      }
    }

    return NextResponse.json(
      { error: "Conversion failed — try a different quality" },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
