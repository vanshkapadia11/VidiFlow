// app/api/twitter/route.js
import { NextResponse } from "next/server";

function extractTweetId(url) {
  const patterns = [
    /twitter\.com\/[^/]+\/status\/(\d+)/,
    /x\.com\/[^/]+\/status\/(\d+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function decodeUrl(str) {
  if (!str) return "";
  return str
    .replace(/\\u002F/gi, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/")
    .trim();
}

// Parse mp4 links + quality labels from any downloader HTML response
function parseFormatsFromHtml(html) {
  const formats = [];
  const seenUrls = new Set();

  // Match href="...mp4..." with nearby quality labels
  const hrefMatches = [
    ...html.matchAll(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/g),
  ];
  for (const m of hrefMatches) {
    const url = m[1].replace(/&amp;/g, "&");
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    // Look for resolution near the link
    const pos = html.indexOf(m[0]);
    const nearby = html.substring(Math.max(0, pos - 200), pos + 200);
    const resMatch =
      nearby.match(/(\d{3,4})[xX×](\d{3,4})/) || nearby.match(/(\d{3,4})p/);
    const quality = resMatch
      ? resMatch[2]
        ? `${resMatch[2]}p`
        : `${resMatch[1]}p`
      : formats.length === 0
        ? "HD"
        : "SD";

    formats.push({ url, quality, label: quality });
  }

  return formats;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    url = url.trim();
    console.log("[XSave] Input URL:", url);

    // Resolve short links (t.co, etc.)
    if (!url.includes("/status/")) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        url = res.url;
        console.log("[XSave] Resolved:", url);
      } catch {}
    }

    const tweetId = extractTweetId(url);
    if (!tweetId)
      return NextResponse.json(
        { error: "Invalid Twitter/X URL." },
        { status: 400 },
      );
    console.log("[XSave] Tweet ID:", tweetId);

    // Normalize: always use twitter.com internally (more compatible)
    const twitterUrl = url.replace("x.com", "twitter.com");
    const xUrl = url.replace("twitter.com", "x.com");

    // ── STRATEGY A: RapidAPI (most reliable in 2026) ──
    if (process.env.RAPIDAPI_KEY) {
      // A1: twitter-downloader (dedicated, most accurate)
      try {
        console.log("[XSave] Trying RapidAPI twitter-downloader...");
        const r = await fetch(
          `https://twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com/status?url=${encodeURIComponent(twitterUrl)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host":
                "twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const d = await r.json();
          console.log(
            "[XSave] twitter-downloader:",
            JSON.stringify(d).substring(0, 400),
          );
          const videos = (d.media || []).filter(
            (m) => m.url?.includes(".mp4") || m.type === "video",
          );
          if (videos.length > 0) {
            const formats = videos
              .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
              .map((v) => ({
                quality: v.quality || "HD",
                url: v.url,
                label: v.quality || "HD",
              }));
            console.log("[XSave] ✅ twitter-downloader success");
            return NextResponse.json({
              tweetId,
              formats,
              defaultUrl: formats[0].url,
              thumbnail: d.thumbnail || null,
              title: d.text || "X / Twitter Video",
              author: d.author?.name || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[XSave] twitter-downloader failed:", e.message);
      }

      // A2: twitter-api45 — returns clean video variants
      try {
        console.log("[XSave] Trying RapidAPI twitter-api45...");
        const r = await fetch(
          `https://twitter-api45.p.rapidapi.com/tweet.php?id=${tweetId}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "twitter-api45.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const d = await r.json();
          console.log(
            "[XSave] twitter-api45:",
            JSON.stringify(d).substring(0, 400),
          );
          const variants =
            d.video?.variants || d.media?.[0]?.video_info?.variants || [];
          const mp4s = variants
            .filter(
              (v) => v.content_type === "video/mp4" || v.url?.includes(".mp4"),
            )
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

          if (mp4s.length > 0) {
            const formats = mp4s.map((v) => {
              const res = v.url?.match(/\/(\d{3,4})x(\d{3,4})\//);
              const quality = res
                ? `${res[2]}p`
                : v.bitrate > 1500000
                  ? "720p"
                  : v.bitrate > 600000
                    ? "480p"
                    : "360p";
              return { quality, url: v.url, label: quality };
            });
            console.log("[XSave] ✅ twitter-api45 success");
            return NextResponse.json({
              tweetId,
              formats,
              defaultUrl: formats[0].url,
              thumbnail: d.thumbnail || d.media?.[0]?.media_url_https || null,
              title: d.text || d.full_text || "X / Twitter Video",
              author: d.author?.name || d.user?.name || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[XSave] twitter-api45 failed:", e.message);
      }

      // A3: social-media-video-downloader
      try {
        console.log("[XSave] Trying RapidAPI SMVD...");
        const r = await fetch(
          "https://social-media-video-downloader.p.rapidapi.com/smvd/get/all",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com",
            },
            body: JSON.stringify({ url: twitterUrl }),
          },
        );
        if (r.ok) {
          const d = await r.json();
          if (d.success && d.links?.length > 0) {
            const formats = d.links.map((l) => ({
              quality: l.quality || "HD",
              url: l.link,
              label: l.quality || "HD",
            }));
            console.log("[XSave] ✅ SMVD success");
            return NextResponse.json({
              tweetId,
              formats,
              defaultUrl: formats[0].url,
              thumbnail: d.picture || null,
              title: d.title || "X / Twitter Video",
              author: "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[XSave] SMVD failed:", e.message);
      }
    }

    // ── STRATEGY B: twitsave.com ──
    try {
      console.log("[XSave] Trying twitsave.com...");
      const r = await fetch(
        `https://twitsave.com/info?url=${encodeURIComponent(twitterUrl)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://twitsave.com/",
          },
        },
      );
      if (r.ok) {
        const d = await r.json();
        console.log("[XSave] twitsave:", JSON.stringify(d).substring(0, 300));
        if (d.videos?.length > 0) {
          const formats = [...d.videos]
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
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
              thumbnail: d.thumbnail || null,
              title: d.text || "X / Twitter Video",
              author: d.author?.name || "",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[XSave] twitsave failed:", e.message);
    }

    // ── STRATEGY C: ssstwitter.com ──
    try {
      console.log("[XSave] Trying ssstwitter.com...");
      const initRes = await fetch("https://ssstwitter.com/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const initHtml = await initRes.text();
      const tok =
        initHtml.match(/name="token"\s+value="([^"]+)"/) ||
        initHtml.match(/"token":"([^"]+)"/);
      const cookies = initRes.headers.get("set-cookie") || "";

      if (tok) {
        const sub = await fetch("https://ssstwitter.com/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://ssstwitter.com/",
            Origin: "https://ssstwitter.com",
            Cookie: cookies,
          },
          body: new URLSearchParams({
            id: twitterUrl,
            locale: "en",
            tt: tok[1],
          }),
        });
        if (sub.ok) {
          const html = await sub.text();
          const formats = parseFormatsFromHtml(html);
          if (formats.length > 0) {
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

    // ── STRATEGY D: twdown.net ──
    try {
      console.log("[XSave] Trying twdown.net...");
      const r = await fetch(`https://twdown.net/download.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://twdown.net/",
          Origin: "https://twdown.net",
        },
        body: new URLSearchParams({ URL: twitterUrl }),
      });
      if (r.ok) {
        const html = await r.text();
        const formats = parseFormatsFromHtml(html);
        if (formats.length > 0) {
          console.log("[XSave] ✅ twdown success");
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
    } catch (e) {
      console.error("[XSave] twdown failed:", e.message);
    }

    // ── STRATEGY E: cobalt.tools ──
    try {
      console.log("[XSave] Trying cobalt.tools...");
      const r = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
          url: twitterUrl,
          videoQuality: "1080",
          filenameStyle: "classic",
        }),
      });
      if (r.ok) {
        const d = await r.json();
        console.log("[XSave] cobalt:", JSON.stringify(d).substring(0, 300));
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

    // ── STRATEGY F: vxtwitter.com (open-source Twitter embed proxy) ──
    try {
      console.log("[XSave] Trying vxtwitter.com API...");
      const vxUrl = twitterUrl.replace("twitter.com", "api.vxtwitter.com");
      const r = await fetch(vxUrl, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      });
      if (r.ok) {
        const d = await r.json();
        console.log("[XSave] vxtwitter:", JSON.stringify(d).substring(0, 400));
        const media = d.mediaURLs || d.media_extended || [];
        const videos = media.filter(
          (m) => m.type === "video" || m.url?.includes(".mp4"),
        );
        if (videos.length > 0) {
          const formats = videos.map((v, i) => ({
            quality: v.size ? `${v.size.height}p` : i === 0 ? "HD" : "SD",
            url: v.url,
            label: v.size ? `${v.size.height}p` : i === 0 ? "HD" : "SD",
          }));
          console.log("[XSave] ✅ vxtwitter success");
          return NextResponse.json({
            tweetId,
            formats,
            defaultUrl: formats[0].url,
            thumbnail: d.user_profile_image_url || null,
            title: d.text || "X / Twitter Video",
            author: d.user_name || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[XSave] vxtwitter failed:", e.message);
    }

    // ── STRATEGY G: fxtwitter.com (another open embed proxy) ──
    try {
      console.log("[XSave] Trying fxtwitter API...");
      const fxUrl = `https://api.fxtwitter.com/status/${tweetId}`;
      const r = await fetch(fxUrl, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      });
      if (r.ok) {
        const d = await r.json();
        console.log("[XSave] fxtwitter:", JSON.stringify(d).substring(0, 400));
        const tweet = d.tweet || d;
        const media = tweet.media?.videos || tweet.media?.all || [];
        const videos = media.filter(
          (m) => m.type === "video" || m.url?.includes(".mp4"),
        );
        if (videos.length > 0) {
          const formats = videos.map((v, i) => ({
            quality: v.height ? `${v.height}p` : i === 0 ? "HD" : "SD",
            url: v.url,
            label: v.height ? `${v.height}p` : i === 0 ? "HD" : "SD",
          }));
          console.log("[XSave] ✅ fxtwitter success");
          return NextResponse.json({
            tweetId,
            formats,
            defaultUrl: formats[0].url,
            thumbnail: tweet.author?.avatar_url || null,
            title: tweet.text || "X / Twitter Video",
            author: tweet.author?.name || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[XSave] fxtwitter failed:", e.message);
    }

    console.log("[XSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. Make sure the tweet is public and contains a video. Add RAPIDAPI_KEY to .env.local for best results.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[XSave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
