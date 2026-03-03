// app/api/twitter/route.js
import { NextResponse } from "next/server";

function extractTweetId(url) {
  const patterns = [
    /twitter\.com\/[^/]+\/status\/(\d+)/,
    /x\.com\/[^/]+\/status\/(\d+)/,
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
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    url = url.trim();
    console.log("[XSave] Input URL:", url);

    // Resolve short links
    if (!url.includes("/status/")) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        url = res.url;
      } catch (e) {}
    }

    const tweetId = extractTweetId(url);
    if (!tweetId)
      return NextResponse.json(
        { error: "Invalid Twitter/X URL." },
        { status: 400 },
      );
    console.log("[XSave] Tweet ID:", tweetId);

    // ── STRATEGY A: twitsave.com ──
    try {
      const tsRes = await fetch(
        `https://twitsave.com/info?url=${encodeURIComponent(url)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://twitsave.com/",
          },
        },
      );
      if (tsRes.ok) {
        const tsData = await tsRes.json();
        if (tsData.videos?.length > 0) {
          const sorted = [...tsData.videos].sort(
            (a, b) => (b.bitrate || 0) - (a.bitrate || 0),
          );
          const formats = sorted
            .map((v) => ({
              quality: v.quality || "HD",
              url: v.download_url || v.url,
              label: v.quality || "HD",
            }))
            .filter((f) => f.url);

          if (formats.length > 0) {
            console.log("[XSave] ✅ twitsave success");
            return NextResponse.json({
              tweetId,
              formats,
              defaultUrl: formats[0].url,
              thumbnail: tsData.thumbnail || null,
              title: tsData.text || "X / Twitter Video",
              author: tsData.author?.name || "",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[XSave] twitsave failed:", e.message);
    }

    // ── STRATEGY B: ssstwitter.com ──
    try {
      const sssRes = await fetch("https://ssstwitter.com/", {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const sssHtml = await sssRes.text();
      const tokenMatch =
        sssHtml.match(/name="token"\s+value="([^"]+)"/) ||
        sssHtml.match(/"token":"([^"]+)"/);
      const cookies = sssRes.headers.get("set-cookie") || "";

      if (tokenMatch) {
        const submitRes = await fetch("https://ssstwitter.com/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://ssstwitter.com/",
            Origin: "https://ssstwitter.com",
            Cookie: cookies,
          },
          body: new URLSearchParams({
            id: url,
            locale: "en",
            tt: tokenMatch[1],
          }),
        });

        if (submitRes.ok) {
          const resultHtml = await submitRes.text();
          const mp4Matches = [
            ...resultHtml.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/g),
          ];
          const qualityMatches = [...resultHtml.matchAll(/(\d+)x(\d+)/g)];

          if (mp4Matches.length > 0) {
            const formats = mp4Matches.map((m, i) => {
              const q = qualityMatches[i];
              return {
                url: m[1].replace(/&amp;/g, "&"),
                quality: q ? `${q[2]}p` : `Option ${i + 1}`,
                label: q ? `${q[2]}p` : `Option ${i + 1}`,
              };
            });
            console.log("[XSave] ✅ ssstwitter success");
            return NextResponse.json({
              tweetId,
              formats,
              defaultUrl: formats[0].url,
              thumbnail: null,
              title: "X / Twitter Video",
              author: "",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[XSave] ssstwitter failed:", e.message);
    }

    // ── STRATEGY C: cobalt.tools ──
    try {
      const cobaltRes = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
          url: url.replace("x.com", "twitter.com"),
          videoQuality: "1080",
          filenameStyle: "classic",
        }),
      });
      if (cobaltRes.ok) {
        const d = await cobaltRes.json();
        if (
          (d.status === "stream" ||
            d.status === "redirect" ||
            d.status === "tunnel") &&
          d.url
        ) {
          console.log("[XSave] ✅ cobalt success");
          return NextResponse.json({
            tweetId,
            formats: [{ quality: "Best", url: d.url, label: "Best Quality" }],
            defaultUrl: d.url,
            thumbnail: null,
            title: "X / Twitter Video",
            author: "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[XSave] cobalt failed:", e.message);
    }

    // ── STRATEGY D: RapidAPI (optional, set RAPIDAPI_KEY in .env.local) ──
    if (process.env.RAPIDAPI_KEY) {
      try {
        const rapidRes = await fetch(
          `https://twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com/status?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host":
                "twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com",
            },
          },
        );
        if (rapidRes.ok) {
          const d = await rapidRes.json();
          const videos = d.media?.filter((m) => m.url?.includes(".mp4")) || [];
          if (videos.length > 0) {
            const formats = videos.map((v) => ({
              quality: v.quality || "HD",
              url: v.url,
              label: v.quality || "HD",
            }));
            console.log("[XSave] ✅ RapidAPI success");
            return NextResponse.json({
              tweetId,
              formats,
              defaultUrl: formats[0].url,
              thumbnail: d.thumbnail || null,
              title: d.text || "X Video",
              author: d.author?.name || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[XSave] RapidAPI failed:", e.message);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. Make sure the tweet is public and contains a video.",
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
