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

// FIX 1: Detect bot-wall / login-redirect HTML responses before doing anything with them
function isBlockedPage(html) {
  if (!html || html.length < 500) return true;
  const lower = html.toLowerCase();
  return (
    lower.includes("log in to snapchat") ||
    lower.includes("sign in to snapchat") ||
    lower.includes("login_page") ||
    lower.includes("accounts.snapchat.com") ||
    // Snapchat returns a nearly-empty JS bundle page for bot UAs on some URLs
    (lower.includes("<title>snapchat</title>") && !lower.includes("sc-cdn.net"))
  );
}

function normalizeSnapchatUrl(url) {
  try {
    const u = new URL(url);
    // /@username/spotlight/ID  →  /spotlight/ID
    const profileSpotlight = u.pathname.match(/^\/@[^/]+\/spotlight\/(.+)$/);
    if (profileSpotlight) {
      const canonical = `https://www.snapchat.com/spotlight/${profileSpotlight[1]}`;
      return { canonical, original: url };
    }
    // /p/username/spotlight/ID  →  /spotlight/ID
    const pSpotlight = u.pathname.match(/^\/p\/[^/]+\/spotlight\/(.+)$/);
    if (pSpotlight) {
      const canonical = `https://www.snapchat.com/spotlight/${pSpotlight[1]}`;
      return { canonical, original: url };
    }
  } catch {}
  return { canonical: url, original: url };
}

function extractSnapVideoUrls(html) {
  const candidates = new Set();

  // 1. <link rel="preload" as="video" href="...">
  for (const m of html.matchAll(/<link[^>]+as="video"[^>]+href="([^"]+)"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]+as="video"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }

  // 2. bolt-gcdn.sc-cdn.net/u/
  for (const m of html.matchAll(
    /https?:\/\/bolt-gcdn\.sc-cdn\.net\/u\/[^\s"'<>&\\]+/g,
  )) {
    candidates.add(decodeUrl(m[0]));
  }
  for (const m of html.matchAll(
    /https?:\\u002F\\u002Fbolt-gcdn\.sc-cdn\.net\\u002Fu\\u002F[^\s"'<>\\]+/gi,
  )) {
    candidates.add(decodeUrl(m[0]));
  }

  // 3. cf-st.sc-cdn.net/v/
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

  // 5. Any .mp4
  for (const m of html.matchAll(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/g)) {
    candidates.add(decodeUrl(m[0]));
  }

  // 6. JSON "url" / "videoUrl" pointing to sc-cdn
  for (const m of html.matchAll(
    /"(?:url|videoUrl|video_url|streamingUrl|playbackUrl|src)"\s*:\s*"(https?:\/\/[^"]*sc-cdn\.net[^"]*)"/g,
  )) {
    candidates.add(decodeUrl(m[1]));
  }

  // 7. __NEXT_DATA__ deep scan — FIX 2: fully guarded JSON parse
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (nextDataMatch) {
    try {
      const raw = nextDataMatch[1].trim();
      // FIX 2a: bail out immediately if it doesn't look like JSON
      if (!raw.startsWith("{") && !raw.startsWith("[")) {
        console.warn(
          "[SnapSave] __NEXT_DATA__ doesn't look like JSON, skipping parse",
        );
      } else {
        const parsed = JSON.parse(raw);
        const str = JSON.stringify(parsed);

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

        function walkForMedia(obj, depth = 0) {
          if (!obj || typeof obj !== "object" || depth > 20) return;
          for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (
              typeof val === "string" &&
              val.startsWith("https://") &&
              val.includes("sc-cdn.net")
            ) {
              candidates.add(val);
            } else if (typeof val === "object") {
              walkForMedia(val, depth + 1);
            }
          }
        }
        walkForMedia(parsed);
      }
    } catch (e) {
      // FIX 2b: log but never throw — a bad __NEXT_DATA__ block should never crash the route
      console.warn("[SnapSave] __NEXT_DATA__ parse failed:", e.message);
    }
  }

  // 8. snapMedia JSON blobs
  for (const m of html.matchAll(
    /"snapMediaType"\s*:\s*"VIDEO"[\s\S]{0,500}?"url"\s*:\s*"(https?:\/\/[^"]+)"/g,
  )) {
    candidates.add(decodeUrl(m[1]));
  }

  // 9. <video> / <source> src attributes
  for (const m of html.matchAll(/<video[^>]+src="([^"]+)"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(/<source[^>]+src="([^"]+)"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }

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

// FIX 3: Safe JSON parse helper for API responses — never throws on HTML
async function safeJson(response) {
  const text = await response.text();
  if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
    console.warn(
      "[SnapSave] Expected JSON but got HTML/text response, status:",
      response.status,
    );
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn(
      "[SnapSave] JSON parse failed:",
      e.message,
      "| First 120 chars:",
      text.slice(0, 120),
    );
    return null;
  }
}

async function scrapeUrl(url, ua) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": ua,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });
  const html = await r.text();

  // FIX 4: Skip extraction entirely if we got a bot-wall page
  if (isBlockedPage(html)) {
    console.warn(`[SnapSave] Bot-wall detected for ${url.substring(0, 60)}`);
    return { html, videoUrls: [] };
  }

  console.log(
    `[SnapSave] HTML: ${html.length} | bolt-gcdn: ${html.includes("bolt-gcdn")} | mp4: ${html.includes(".mp4")}`,
  );
  return { html, videoUrls: extractSnapVideoUrls(html) };
}

// FIX 5: Probe the Next.js JSON data API directly — often bypasses the bot wall
async function probeNextDataApi(spotlightId) {
  const apiUrl = `https://www.snapchat.com/_next/data/latest/spotlight/${spotlightId}.json`;
  try {
    const r = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "application/json",
      },
    });
    if (!r.ok) return null;
    const data = await safeJson(r);
    if (!data) return null;
    const str = JSON.stringify(data);
    const candidates = [];
    for (const m of str.matchAll(
      /"(https?:\\?\/\\?\/bolt-gcdn\.sc-cdn\.net[^"]*)"/g,
    )) {
      candidates.push(decodeUrl(m[1]));
    }
    for (const m of str.matchAll(
      /"(https?:\\?\/\\?\/[^"]*sc-cdn\.net[^"]*(?:video|stream|\.mp4)[^"]*)"/g,
    )) {
      candidates.push(decodeUrl(m[1]));
    }
    return candidates.length > 0 ? candidates[0] : null;
  } catch (e) {
    console.warn("[SnapSave] _next/data probe failed:", e.message);
    return null;
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

    if (url.includes("t.snapchat.com") || url.includes("snapchat.app.link")) {
      url = await resolveRedirect(url);
      console.log("[SnapSave] Resolved:", url);
    }

    const { canonical, original } = normalizeSnapchatUrl(url);
    const urlsToTry =
      canonical !== original ? [canonical, original] : [original];
    console.log("[SnapSave] URLs to try:", urlsToTry);

    // FIX 5: Try the Next.js data API first for spotlight URLs (no bot-wall)
    const spotlightIdMatch = canonical.match(/\/spotlight\/([A-Za-z0-9_-]+)/);
    if (spotlightIdMatch) {
      console.log(
        "[SnapSave] Probing _next/data API for spotlight:",
        spotlightIdMatch[1],
      );
      const nextDataVideo = await probeNextDataApi(spotlightIdMatch[1]);
      if (nextDataVideo) {
        console.log("[SnapSave] ✅ _next/data API success");
        return NextResponse.json({
          videoUrl: nextDataVideo,
          thumbnail: null,
          title: "Snapchat Spotlight",
          success: true,
        });
      }
    }

    // ── STRATEGY A: RapidAPI ──────────────────────────────────────────────────
    if (process.env.RAPIDAPI_KEY) {
      for (const tryUrl of urlsToTry) {
        try {
          console.log("[SnapSave] Trying RapidAPI snapchat-scraper:", tryUrl);
          const r = await fetch(
            `https://snapchat-scraper.p.rapidapi.com/v1/spotlight?url=${encodeURIComponent(tryUrl)}`,
            {
              headers: {
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                "X-RapidAPI-Host": "snapchat-scraper.p.rapidapi.com",
              },
            },
          );
          if (r.ok) {
            // FIX 3 applied: use safeJson instead of r.json()
            const data = await safeJson(r);
            if (data) {
              const videoUrl =
                data.video_url ||
                data.videoUrl ||
                data.url ||
                data.download_url;
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
          }
        } catch (e) {
          console.error("[SnapSave] snapchat-scraper failed:", e.message);
        }
      }

      for (const tryUrl of urlsToTry) {
        try {
          console.log("[SnapSave] Trying RapidAPI SMVD:", tryUrl);
          const r = await fetch(
            "https://social-media-video-downloader.p.rapidapi.com/smvd/get/all",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                "X-RapidAPI-Host":
                  "social-media-video-downloader.p.rapidapi.com",
              },
              body: JSON.stringify({ url: tryUrl }),
            },
          );
          if (r.ok) {
            // FIX 3 applied
            const data = await safeJson(r);
            if (data && data.success && data.links?.length > 0) {
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
    }

    // ── STRATEGY B: Direct page scrape ───────────────────────────────────────
    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Twitterbot/1.0",
    ];

    for (const tryUrl of urlsToTry) {
      for (const ua of uas) {
        try {
          console.log(
            `[SnapSave] Scraping ${tryUrl.substring(0, 60)} | UA: ${ua.substring(0, 40)}...`,
          );
          const { html, videoUrls } = await scrapeUrl(tryUrl, ua);

          console.log(
            `[SnapSave] Found ${videoUrls.length} URLs:`,
            videoUrls.slice(0, 2).map((u) => u.substring(0, 80)),
          );

          if (videoUrls.length > 0) {
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
    }

    // ── STRATEGY C: snapsave.app ──────────────────────────────────────────────
    for (const tryUrl of urlsToTry) {
      try {
        console.log("[SnapSave] Trying snapsave.app with:", tryUrl);
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
            body: new URLSearchParams({ url: tryUrl, _token: tok[1] }),
          });
          if (sub.ok) {
            // FIX 6: snapsave returns HTML, not JSON — don't call .json() here
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
    }

    console.log("[SnapSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. The Spotlight may be private or Snapchat's bot detection blocked all strategies. Add RAPIDAPI_KEY to .env.local for best results.",
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
