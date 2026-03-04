// app/api/snapchat/route.js
import { NextResponse } from "next/server";

function decodeUrl(str) {
  if (!str) return "";
  let s = str;
  for (let i = 0; i < 3; i++) {
    s = s
      .replace(/\\u002F/gi, "/")
      .replace(/\\u0026/gi, "&")
      .replace(/\\u003A/gi, ":")
      .replace(/\\\//g, "/")
      .replace(/\\"/g, '"')
      .replace(/&amp;/g, "&");
  }
  return s.trim();
}

function extractOgImage(html) {
  const m =
    html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/) ||
    html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/) ||
    html.match(
      /href="(https:\/\/cf-st\.sc-cdn\.net\/d\/[^"]+)"[^>]*as="image"/,
    );
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

function extractOgTitle(html) {
  const captionMatch =
    html.match(/"caption"\s*:\s*"([^"]{3,100})"/) ||
    html.match(/"description"\s*:\s*"([^"]{5,100})"/);
  if (captionMatch) {
    const caption = decodeUrl(captionMatch[1]).replace(/\\n/g, " ").trim();
    if (caption.length > 3) return caption;
  }
  const m =
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) ||
    html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/) ||
    html.match(/<title>([^<]+)<\/title>/);
  return m
    ? m[1]
        .replace(/&amp;/g, "&")
        .replace(/ \| Snapchat$/, "")
        .trim()
    : "Snapchat Video";
}

// THE KEY FIX: Snapchat serves video via bolt-gcdn.sc-cdn.net/u/ with NO .mp4 extension
// and embeds it via <link rel="preload" as="video" href="...">
function extractSnapVideoUrls(html) {
  const candidates = new Set();

  // 1. <link rel="preload" as="video" href="..."> — Snapchat's primary video embed method
  for (const m of html.matchAll(/<link[^>]+as="video"[^>]+href="([^"]+)"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]+as="video"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }

  // 2. bolt-gcdn.sc-cdn.net/u/ — Snapchat's video streaming CDN (no .mp4 extension)
  for (const m of html.matchAll(
    /https?:\/\/bolt-gcdn\.sc-cdn\.net\/u\/[^\s"'<>&\\]+/g,
  )) {
    candidates.add(decodeUrl(m[0]));
  }
  // Escaped versions in JSON
  for (const m of html.matchAll(
    /https?:\\u002F\\u002Fbolt-gcdn\.sc-cdn\.net\\u002Fu\\u002F[^\s"'<>\\]+/gi,
  )) {
    candidates.add(decodeUrl(m[0]));
  }

  // 3. cf-st.sc-cdn.net/v/ — another Snapchat video endpoint
  for (const m of html.matchAll(
    /https?:\/\/cf-st\.sc-cdn\.net\/v\/[^\s"'<>&\\]+/g,
  )) {
    candidates.add(decodeUrl(m[0]));
  }

  // 4. og:video meta tag
  for (const m of html.matchAll(
    /<meta[^>]+property="og:video(?::url)?"[^>]+content="([^"]+)"/g,
  )) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(
    /<meta[^>]+content="([^"]+)"[^>]+property="og:video(?::url)?"/g,
  )) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }

  // 5. Any .mp4 (older Spotlight format)
  for (const m of html.matchAll(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/g)) {
    candidates.add(decodeUrl(m[0]));
  }

  // 6. JSON "url" / "videoUrl" pointing to sc-cdn
  for (const m of html.matchAll(
    /"(?:url|videoUrl|video_url|streamingUrl|playbackUrl|src)"\s*:\s*"(https?:\/\/[^"]*sc-cdn\.net[^"]*)"/g,
  )) {
    candidates.add(decodeUrl(m[1]));
  }

  // 7. __NEXT_DATA__ deep scan
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (nextDataMatch) {
    try {
      const str = JSON.stringify(JSON.parse(nextDataMatch[1]));
      for (const m of str.matchAll(
        /"(https?:\\?\/\\?\/bolt-gcdn\.sc-cdn\.net[^"]*)"/g,
      )) {
        candidates.add(decodeUrl(m[1]));
      }
      for (const m of str.matchAll(
        /"(https?:\\?\/\\?\/[^"]*sc-cdn\.net[^"]*(?:video|stream|\.mp4)[^"]*)"/g,
      )) {
        candidates.add(decodeUrl(m[1]));
      }
    } catch {}
  }

  // Filter: only valid https from known Snapchat CDNs
  return [...candidates].filter((u) => {
    try {
      const p = new URL(u);
      return (
        p.protocol === "https:" &&
        (p.hostname.includes("sc-cdn.net") ||
          p.hostname.includes("snapchat.com") ||
          p.hostname.includes("snap.com") ||
          u.includes(".mp4"))
      );
    } catch {
      return false;
    }
  });
}

async function resolveRedirect(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
      },
    });
    return res.url;
  } catch {
    return url;
  }
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[SnapSave] Input URL:", url);

    // Resolve short links
    if (url.includes("t.snapchat.com") || url.includes("snapchat.app.link")) {
      url = await resolveRedirect(url);
      console.log("[SnapSave] Resolved:", url);
    }

    // ── STRATEGY A: RapidAPI ──
    if (process.env.RAPIDAPI_KEY) {
      try {
        console.log("[SnapSave] Trying RapidAPI snapchat-scraper...");
        const r = await fetch(
          `https://snapchat-scraper.p.rapidapi.com/v1/spotlight?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "snapchat-scraper.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const data = await r.json();
          const videoUrl =
            data.video_url || data.videoUrl || data.url || data.download_url;
          if (videoUrl) {
            console.log("[SnapSave] ✅ snapchat-scraper success");
            return NextResponse.json({
              videoUrl,
              thumbnail: data.thumbnail || null,
              title: data.title || data.caption || "Snapchat Video",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[SnapSave] snapchat-scraper failed:", e.message);
      }

      try {
        console.log("[SnapSave] Trying RapidAPI SMVD...");
        const r = await fetch(
          "https://social-media-video-downloader.p.rapidapi.com/smvd/get/all",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com",
            },
            body: JSON.stringify({ url }),
          },
        );
        if (r.ok) {
          const data = await r.json();
          if (data.success && data.links?.length > 0) {
            console.log("[SnapSave] ✅ SMVD success");
            return NextResponse.json({
              videoUrl: data.links[0].link,
              thumbnail: data.picture || null,
              title: data.title || "Snapchat Video",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[SnapSave] SMVD failed:", e.message);
      }
    }

    // ── STRATEGY B: Direct page scrape (4 User-Agents) ──
    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Twitterbot/1.0",
    ];

    for (const ua of uas) {
      try {
        console.log(`[SnapSave] Scraping: ${ua.substring(0, 40)}...`);
        const r = await fetch(url, {
          headers: {
            "User-Agent": ua,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
          },
        });

        const html = await r.text();
        console.log(
          `[SnapSave] HTML: ${html.length} | bolt-gcdn: ${html.includes("bolt-gcdn")} | mp4: ${html.includes(".mp4")}`,
        );

        const videoUrls = extractSnapVideoUrls(html);
        console.log(
          `[SnapSave] Found ${videoUrls.length} URLs:`,
          videoUrls.slice(0, 2).map((u) => u.substring(0, 80)),
        );

        if (videoUrls.length > 0) {
          // Prefer bolt-gcdn (actual video) over cf-st (may be thumbnail CDN)
          const bestUrl =
            videoUrls.find((u) => u.includes("bolt-gcdn")) || videoUrls[0];
          console.log(
            "[SnapSave] ✅ Page scrape success — URL:",
            bestUrl.substring(0, 80),
          );
          return NextResponse.json({
            videoUrl: bestUrl,
            thumbnail: extractOgImage(html),
            title: extractOgTitle(html),
            success: true,
          });
        }
      } catch (e) {
        console.error(`[SnapSave] Scrape failed:`, e.message);
      }
    }

    // ── STRATEGY C: snapsave.app ──
    try {
      console.log("[SnapSave] Trying snapsave.app...");
      const initRes = await fetch("https://snapsave.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const initHtml = await initRes.text();
      const tok =
        initHtml.match(/name="_token"\s+value="([^"]+)"/) ||
        initHtml.match(/name="token"\s+value="([^"]+)"/);
      const cookies = initRes.headers.get("set-cookie") || "";

      if (tok) {
        const sub = await fetch("https://snapsave.app/action.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://snapsave.app/",
            Origin: "https://snapsave.app",
            Cookie: cookies,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({ url, _token: tok[1] }),
        });
        if (sub.ok) {
          const html = await sub.text();
          const videoUrls = extractSnapVideoUrls(html);
          if (videoUrls.length > 0) {
            console.log("[SnapSave] ✅ snapsave.app success");
            const thumbMatch = html.match(
              /src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/,
            );
            return NextResponse.json({
              videoUrl: videoUrls[0],
              thumbnail: thumbMatch ? thumbMatch[1] : null,
              title: "Snapchat Video",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[SnapSave] snapsave.app failed:", e.message);
    }

    console.log("[SnapSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. Make sure the link is a public Spotlight. Add RAPIDAPI_KEY to .env.local for best results.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[SnapSave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
