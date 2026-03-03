// app/api/youtube-audio/route.js
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
      };
    }
  } catch (e) {
    /* ignore */
  }
  return {
    title: "",
    author: "",
    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[YTAudio] Input URL:", url);

    let videoId = extractVideoId(url);

    if (!videoId) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        videoId = extractVideoId(res.url);
        console.log("[YTAudio] Resolved video ID:", videoId);
      } catch (e) {
        console.error("[YTAudio] Redirect failed:", e.message);
      }
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL — could not find video ID." },
        { status: 400 },
      );
    }

    console.log("[YTAudio] Video ID:", videoId);
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const meta = await getYouTubeMetadata(videoId);

    // ── STRATEGY A: cobalt.tools audio mode ──
    try {
      console.log("[YTAudio] Trying cobalt.tools...");
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
          downloadMode: "audio",
          audioFormat: "mp3",
          audioBitrate: "320",
          filenameStyle: "classic",
        }),
      });

      console.log("[YTAudio] cobalt status:", cobaltRes.status);
      if (cobaltRes.ok) {
        const data = await cobaltRes.json();
        console.log(
          "[YTAudio] cobalt response:",
          JSON.stringify(data).substring(0, 300),
        );
        if (
          (data.status === "stream" ||
            data.status === "redirect" ||
            data.status === "tunnel") &&
          data.url
        ) {
          console.log("[YTAudio] ✅ cobalt audio success");
          return NextResponse.json({
            videoId,
            audioUrl: data.url,
            format: "mp3",
            bitrate: "320kbps",
            thumbnail: meta.thumbnail,
            title: meta.title,
            author: meta.author,
            success: true,
          });
        }
        console.log(
          "[YTAudio] cobalt non-success:",
          data.status,
          data.error?.code,
        );
      }
    } catch (e) {
      console.error("[YTAudio] cobalt failed:", e.message);
    }

    // ── STRATEGY B: yt5s.io mp3 ──
    try {
      console.log("[YTAudio] Trying yt5s.io...");
      const yt5Res = await fetch("https://yt5s.io/api/ajaxSearch/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://yt5s.io/",
          Origin: "https://yt5s.io",
        },
        body: new URLSearchParams({ q: cleanUrl, vt: "home" }),
      });

      if (yt5Res.ok) {
        const yt5Data = await yt5Res.json();
        if (yt5Data.status === "Ok" && yt5Data.links?.mp3) {
          const bitrateOrder = ["320kbps", "256kbps", "128kbps", "64kbps"];
          let bestFormat = null;
          for (const bitrate of bitrateOrder) {
            if (yt5Data.links.mp3[bitrate]?.k) {
              bestFormat = { bitrate, k: yt5Data.links.mp3[bitrate].k };
              break;
            }
          }
          if (!bestFormat) {
            const first = Object.entries(yt5Data.links.mp3)[0];
            if (first) bestFormat = { bitrate: first[0], k: first[1].k };
          }

          if (bestFormat?.k) {
            console.log("[YTAudio] yt5s converting...", bestFormat.bitrate);
            const convertRes = await fetch(
              "https://yt5s.io/api/ajaxConvert/convert",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "User-Agent": "Mozilla/5.0",
                  Referer: "https://yt5s.io/",
                  Origin: "https://yt5s.io",
                },
                body: new URLSearchParams({ vid: videoId, k: bestFormat.k }),
              },
            );
            if (convertRes.ok) {
              const convertData = await convertRes.json();
              if (convertData.status === "Ok" && convertData.dlink) {
                console.log("[YTAudio] ✅ yt5s mp3 success");
                return NextResponse.json({
                  videoId,
                  audioUrl: convertData.dlink,
                  format: "mp3",
                  bitrate: bestFormat.bitrate,
                  thumbnail: yt5Data.thumbnail || meta.thumbnail,
                  title: yt5Data.title || meta.title,
                  author: meta.author,
                  success: true,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("[YTAudio] yt5s failed:", e.message);
    }

    // ── STRATEGY C: y2mate mp3 ──
    try {
      console.log("[YTAudio] Trying y2mate...");
      const analyzeRes = await fetch(
        "https://www.y2mate.com/mates/analyzeV2/ajax",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://www.y2mate.com/",
            Origin: "https://www.y2mate.com",
          },
          body: new URLSearchParams({
            k_query: cleanUrl,
            k_page: "home",
            hl: "en",
            q_auto: "0",
          }),
        },
      );

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        if (analyzeData.status === "Ok" && analyzeData.links?.mp3) {
          const mp3 = analyzeData.links.mp3;
          const best =
            mp3["320kbps"] ||
            mp3["256kbps"] ||
            mp3["128kbps"] ||
            Object.values(mp3)[0];
          if (best?.k) {
            const convertRes = await fetch(
              "https://www.y2mate.com/mates/convertV2/index",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "User-Agent": "Mozilla/5.0",
                  Referer: "https://www.y2mate.com/",
                  Origin: "https://www.y2mate.com",
                },
                body: new URLSearchParams({ vid: videoId, k: best.k }),
              },
            );
            if (convertRes.ok) {
              const convertData = await convertRes.json();
              if (convertData.status === "Ok" && convertData.dlink) {
                console.log("[YTAudio] ✅ y2mate mp3 success");
                return NextResponse.json({
                  videoId,
                  audioUrl: convertData.dlink,
                  format: "mp3",
                  bitrate: "320kbps",
                  thumbnail: analyzeData.thumbnail || meta.thumbnail,
                  title: analyzeData.title || meta.title,
                  author: meta.author,
                  success: true,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("[YTAudio] y2mate failed:", e.message);
    }

    // ── STRATEGY D: loader.to mp3 ──
    try {
      console.log("[YTAudio] Trying loader.to...");
      const loaderRes = await fetch(
        `https://loader.to/api/button/?url=${encodeURIComponent(cleanUrl)}&f=mp3&lang=en`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: "https://loader.to/",
          },
        },
      );
      if (loaderRes.ok) {
        const loaderData = await loaderRes.json();
        if (loaderData.id) {
          for (let i = 0; i < 8; i++) {
            await new Promise((r) => setTimeout(r, 2500));
            const pollRes = await fetch(
              `https://loader.to/api/info/?format=mp3&url=${encodeURIComponent(cleanUrl)}`,
              { headers: { "User-Agent": "Mozilla/5.0" } },
            );
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              if (pollData.success && pollData.download_url) {
                console.log("[YTAudio] ✅ loader.to success");
                return NextResponse.json({
                  videoId,
                  audioUrl: pollData.download_url,
                  format: "mp3",
                  bitrate: "128kbps",
                  thumbnail: meta.thumbnail,
                  title: meta.title,
                  author: meta.author,
                  success: true,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("[YTAudio] loader.to failed:", e.message);
    }

    console.log("[YTAudio] ❌ All strategies failed");
    return NextResponse.json(
      {
        videoId,
        thumbnail: meta.thumbnail,
        title: meta.title,
        author: meta.author,
        success: false,
        error: "Could not extract audio. Try again or use a different video.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[YTAudio] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
