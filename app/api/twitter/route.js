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

  const hrefMatches = [
    ...html.matchAll(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/g),
  ];
  for (const m of hrefMatches) {
    const url = m[1].replace(/&amp;/g, "&");
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

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

// Extract image URLs from various API response shapes
function extractImages(data) {
  const images = [];
  const seen = new Set();

  const addImg = (url) => {
    if (!url || seen.has(url)) return;
    // Skip tiny icons / avatars / profile pics
    if (url.includes("profile_image") || url.includes("avatar")) return;
    seen.add(url);
    images.push(url);
  };

  // Shape 1: media array with type=photo
  for (const m of data.media || []) {
    if (m.type === "photo" || (!m.type && m.url && !m.url.includes(".mp4"))) {
      addImg(m.url || m.media_url_https);
    }
  }

  // Shape 2: extended_entities / entities style (twitter-api45, vxtwitter)
  const mediaList =
    data.extended_entities?.media ||
    data.entities?.media ||
    data.media_extended ||
    [];
  for (const m of mediaList) {
    if (m.type === "photo") {
      addImg(m.media_url_https || m.url);
    }
  }

  // Shape 3: fxtwitter — tweet.media.photos
  const photos = data.tweet?.media?.photos || data.media?.photos || [];
  for (const p of photos) {
    addImg(p.url);
  }

  // Shape 4: mediaURLs array where items are plain strings (vxtwitter sometimes)
  for (const u of data.mediaURLs || []) {
    if (typeof u === "string" && !u.includes(".mp4")) addImg(u);
    else if (u.type === "photo") addImg(u.url);
  }

  // Shape 5: top-level photo array
  for (const p of data.photos || []) {
    addImg(p.url || p);
  }

  return images;
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

    const twitterUrl = url.replace("x.com", "twitter.com");

    // ── STRATEGY A: RapidAPI ──
    if (process.env.RAPIDAPI_KEY) {
      // A1: twitter-downloader
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
          const images = extractImages(d);
          if (videos.length > 0 || images.length > 0) {
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
              images,
              defaultUrl: formats[0]?.url || null,
              thumbnail: d.thumbnail || null,
              title: d.text || "X / Twitter Post",
              author: d.author?.name || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[XSave] twitter-downloader failed:", e.message);
      }

      // A2: twitter-api45
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

          const images = extractImages(d);

          if (mp4s.length > 0 || images.length > 0) {
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
              images,
              defaultUrl: formats[0]?.url || null,
              thumbnail: d.thumbnail || d.media?.[0]?.media_url_https || null,
              title: d.text || d.full_text || "X / Twitter Post",
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
            const images = extractImages(d);
            console.log("[XSave] ✅ SMVD success");
            return NextResponse.json({
              tweetId,
              formats,
              images,
              defaultUrl: formats[0]?.url || null,
              thumbnail: d.picture || null,
              title: d.title || "X / Twitter Post",
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
        if (d.videos?.length > 0 || d.images?.length > 0) {
          const formats = [...(d.videos || [])]
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
            .map((v) => ({
              quality: v.quality || "HD",
              url: v.download_url || v.url,
              label: v.quality || "HD",
            }))
            .filter((f) => f.url);
          const images = extractImages(d);
          if (formats.length > 0 || images.length > 0) {
            console.log("[XSave] ✅ twitsave success");
            return NextResponse.json({
              tweetId,
              formats,
              images,
              defaultUrl: formats[0]?.url || null,
              thumbnail: d.thumbnail || null,
              title: d.text || "X / Twitter Post",
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
              images: [],
              defaultUrl: formats[0].url,
              thumbnail: null,
              title: "X / Twitter Post",
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
            images: [],
            defaultUrl: formats[0].url,
            thumbnail: null,
            title: "X / Twitter Post",
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
            images: [],
            defaultUrl: d.url,
            thumbnail: null,
            title: "X / Twitter Post",
            author: "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[XSave] cobalt failed:", e.message);
    }

    // ── STRATEGY F: vxtwitter.com ──
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
        const images = extractImages(d);
        if (videos.length > 0 || images.length > 0) {
          const formats = videos.map((v, i) => ({
            quality: v.size ? `${v.size.height}p` : i === 0 ? "HD" : "SD",
            url: v.url,
            label: v.size ? `${v.size.height}p` : i === 0 ? "HD" : "SD",
          }));
          console.log("[XSave] ✅ vxtwitter success");
          return NextResponse.json({
            tweetId,
            formats,
            images,
            defaultUrl: formats[0]?.url || null,
            thumbnail: d.user_profile_image_url || null,
            title: d.text || "X / Twitter Post",
            author: d.user_name || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[XSave] vxtwitter failed:", e.message);
    }

    // ── STRATEGY G: fxtwitter.com ──
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
        const images = extractImages(d);
        if (videos.length > 0 || images.length > 0) {
          const formats = videos.map((v, i) => ({
            quality: v.height ? `${v.height}p` : i === 0 ? "HD" : "SD",
            url: v.url,
            label: v.height ? `${v.height}p` : i === 0 ? "HD" : "SD",
          }));
          console.log("[XSave] ✅ fxtwitter success");
          return NextResponse.json({
            tweetId,
            formats,
            images,
            defaultUrl: formats[0]?.url || null,
            thumbnail: tweet.author?.avatar_url || null,
            title: tweet.text || "X / Twitter Post",
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
          "Could not extract media. Make sure the tweet is public and contains a video or image. Add RAPIDAPI_KEY to .env.local for best results.",
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
