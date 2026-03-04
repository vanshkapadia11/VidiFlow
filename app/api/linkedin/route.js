// app/api/linkedin/route.js
import { NextResponse } from "next/server";

function extractLinkedInInfo(url) {
  const postMatch = url.match(/linkedin\.com\/posts\/[^/]+-(\d{10,})/);
  if (postMatch) return { type: "post", id: postMatch[1] };
  const activityMatch = url.match(/urn:li:activity:(\d+)/);
  if (activityMatch) return { type: "activity", id: activityMatch[1] };
  const feedMatch = url.match(/linkedin\.com\/feed\/update\/([^/?]+)/);
  if (feedMatch) return { type: "feed", id: feedMatch[1] };
  const shareMatch = url.match(/linkedin\.com\/share\/([^/?]+)/);
  if (shareMatch) return { type: "share", id: shareMatch[1] };
  const shortMatch = url.match(/lnkd\.in\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return { type: "short", id: shortMatch[1] };
  if (url.includes("linkedin.com")) return { type: "unknown", id: null };
  return null;
}

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
    html.match(/property="og:image"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:image"/);
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

function extractOgTitle(html) {
  const m =
    html.match(/property="og:title"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:title"/) ||
    html.match(/<title>([^<]+)<\/title>/);
  return m
    ? m[1]
        .replace(/&amp;/g, "&")
        .replace(/ \| LinkedIn$/, "")
        .trim()
    : "LinkedIn Post";
}

function extractAuthor(html) {
  const m =
    html.match(
      /"author"\s*:\s*\{\s*"@type"\s*:\s*"Person"\s*,\s*"name"\s*:\s*"([^"]+)"/,
    ) ||
    html.match(/"name"\s*:\s*"([^"]+)"\s*,\s*"headline"/) ||
    html.match(/class="[^"]*actor[^"]*"[^>]*>([^<]+)</);
  return m ? m[1].trim() : "";
}

// Extract all mp4 URLs from any HTML blob
function extractVideoUrls(html) {
  const candidates = new Set();

  // 1. data-sources attribute — LinkedIn's video player
  const dataSourcesMatch = html.match(/data-sources="([^"]+)"/);
  if (dataSourcesMatch) {
    try {
      const sources = JSON.parse(dataSourcesMatch[1].replace(/&quot;/g, '"'));
      if (Array.isArray(sources)) {
        sources.forEach((s) => {
          if (s.src) candidates.add(decodeUrl(s.src));
        });
      }
    } catch {}
  }

  // 2. progressiveUrl in JSON
  for (const m of html.matchAll(
    /"progressiveUrl"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
  )) {
    const u = decodeUrl(m[1]);
    if (u.startsWith("http")) candidates.add(u);
  }

  // 3. streamingLocations url
  for (const m of html.matchAll(
    /"streamingLocations"[\s\S]{0,200}?"url"\s*:\s*"([^"]+\.mp4[^"]*)"/g,
  )) {
    candidates.add(decodeUrl(m[1]));
  }

  // 4. data-media-url
  for (const m of html.matchAll(/data-media-url="([^"]+\.mp4[^"]*)"/g)) {
    candidates.add(decodeUrl(m[1]));
  }

  // 5. og:video
  const ogVid =
    html.match(/property="og:video(?::url)?"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:video(?::url)?"/);
  if (ogVid) candidates.add(ogVid[1].replace(/&amp;/g, "&"));

  // 6. href .mp4 links
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/g)) {
    candidates.add(m[1].replace(/&amp;/g, "&"));
  }

  // 7. JSON "url" fields with .mp4
  for (const m of html.matchAll(
    /"(?:url|src|video_url|download_url)"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/g,
  )) {
    candidates.add(decodeUrl(m[1]));
  }

  // 8. Brute force .mp4 in HTML
  for (const m of html.matchAll(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/g)) {
    candidates.add(decodeUrl(m[0]));
  }

  return [...candidates].filter((u) => {
    try {
      return new URL(u).protocol === "https:";
    } catch {
      return false;
    }
  });
}

// Extract best quality image URLs from HTML
function extractImageUrls(html) {
  const candidates = new Set();

  // 1. og:image
  const ogImg = extractOgImage(html);
  if (ogImg) candidates.add(ogImg);

  // 2. High-res image in JSON (LinkedIn CDN)
  for (const m of html.matchAll(
    /"displayImageReference"[\s\S]{0,500}?"url"\s*:\s*"([^"]+media\.licdn\.com[^"]*)"/g,
  )) {
    candidates.add(decodeUrl(m[1]));
  }
  for (const m of html.matchAll(
    /https?:\/\/media\.licdn\.com\/[^\s"'<>\\]+\.(?:jpg|jpeg|png|webp)[^\s"'<>\\]*/g,
  )) {
    candidates.add(decodeUrl(m[0]));
  }
  for (const m of html.matchAll(
    /https?:\/\/[^\s"'<>\\]+licdn\.com[^\s"'<>\\]+(?:jpg|jpeg|png|webp)[^\s"'<>\\]*/gi,
  )) {
    candidates.add(decodeUrl(m[0]));
  }

  return [...candidates].filter((u) => {
    try {
      return new URL(u).protocol === "https:";
    } catch {
      return false;
    }
  });
}

async function resolveShortLink(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
    console.log("[LISave] Input URL:", url);

    // Resolve short links
    if (url.includes("lnkd.in") || !url.includes("linkedin.com")) {
      url = await resolveShortLink(url);
      console.log("[LISave] Resolved:", url);
    }

    const info = extractLinkedInInfo(url);
    if (!info) {
      return NextResponse.json(
        {
          error:
            "Invalid LinkedIn URL. Please paste a LinkedIn post or video link.",
        },
        { status: 400 },
      );
    }

    // ── STRATEGY A: RapidAPI (most reliable) ──
    if (process.env.RAPIDAPI_KEY) {
      // A1: linkedin-video-downloader2
      try {
        console.log("[LISave] Trying RapidAPI linkedin-video-downloader2...");
        const r = await fetch(
          `https://linkedin-video-downloader2.p.rapidapi.com/download?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "linkedin-video-downloader2.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const d = await r.json();
          console.log("[LISave] ld2:", JSON.stringify(d).substring(0, 400));
          const formats = [];
          if (d.hd)
            formats.push({ quality: "720p", url: d.hd, label: "HD 720p" });
          if (d.sd)
            formats.push({ quality: "360p", url: d.sd, label: "SD 360p" });
          const fallback = d.url || d.downloadUrl || d.video;
          if (!formats.length && fallback)
            formats.push({ quality: "HD", url: fallback, label: "HD Quality" });
          if (formats.length > 0) {
            console.log("[LISave] ✅ linkedin-video-downloader2 success");
            return NextResponse.json({
              type: "video",
              formats,
              defaultUrl: formats[0].url,
              thumbnail: d.thumbnail || null,
              title: d.title || "LinkedIn Video",
              author: d.author || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[LISave] ld2 failed:", e.message);
      }

      // A2: social-media-video-downloader
      try {
        console.log("[LISave] Trying RapidAPI SMVD...");
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
          const d = await r.json();
          if (d.success && d.links?.length > 0) {
            const formats = d.links.map((l) => ({
              quality: l.quality || "HD",
              url: l.link,
              label: l.quality || "HD",
            }));
            console.log("[LISave] ✅ SMVD success");
            return NextResponse.json({
              type: "video",
              formats,
              defaultUrl: formats[0].url,
              thumbnail: d.picture || null,
              title: d.title || "LinkedIn Video",
              author: "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[LISave] SMVD failed:", e.message);
      }
    }

    // ── STRATEGY B: Direct page scrape (multiple UAs) ──
    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    ];

    let bestHtml = "";
    for (const ua of uas) {
      try {
        console.log(`[LISave] Scraping: ${ua.substring(0, 50)}...`);
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
          `[LISave] HTML: ${html.length} | mp4: ${html.includes(".mp4")} | licdn: ${html.includes("licdn.com")}`,
        );

        // Keep the HTML with the most data
        if (html.length > bestHtml.length) bestHtml = html;

        const videoUrls = extractVideoUrls(html);
        if (videoUrls.length > 0) {
          console.log(
            `[LISave] ✅ Found ${videoUrls.length} video URLs via page scrape`,
          );
          const formats = videoUrls.slice(0, 4).map((u, i) => ({
            quality: i === 0 ? "Best" : `Option ${i + 1}`,
            url: u,
            label: i === 0 ? "Best Quality" : `Option ${i + 1}`,
          }));
          return NextResponse.json({
            type: "video",
            formats,
            defaultUrl: formats[0].url,
            thumbnail: extractOgImage(html),
            title: extractOgTitle(html),
            author: extractAuthor(html),
            success: true,
          });
        }
      } catch (e) {
        console.error(`[LISave] Scrape failed:`, e.message);
      }
    }

    // ── STRATEGY C: linkedinsave.app ──
    try {
      console.log("[LISave] Trying linkedinsave.app...");
      const init = await fetch("https://linkedinsave.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const initHtml = await init.text();
      const tok =
        initHtml.match(/name="_token"\s+value="([^"]+)"/) ||
        initHtml.match(/name="csrf_token"\s+value="([^"]+)"/);
      const cookies = init.headers.get("set-cookie") || "";

      if (tok) {
        const sub = await fetch("https://linkedinsave.app/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://linkedinsave.app/",
            Origin: "https://linkedinsave.app",
            Cookie: cookies,
          },
          body: new URLSearchParams({ url, _token: tok[1] }),
        });
        if (sub.ok) {
          const html = await sub.text();
          const videoUrls = extractVideoUrls(html);
          if (videoUrls.length > 0) {
            console.log("[LISave] ✅ linkedinsave success");
            return NextResponse.json({
              type: "video",
              formats: videoUrls
                .slice(0, 4)
                .map((u, i) => ({
                  quality: i === 0 ? "HD" : "SD",
                  url: u,
                  label: i === 0 ? "HD Quality" : "SD Quality",
                })),
              defaultUrl: videoUrls[0],
              thumbnail: null,
              title: "LinkedIn Video",
              author: "",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[LISave] linkedinsave failed:", e.message);
    }

    // ── STRATEGY D: savelinkedin.com ──
    try {
      console.log("[LISave] Trying savelinkedin.com...");
      const r = await fetch("https://savelinkedin.com/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://savelinkedin.com/",
          Origin: "https://savelinkedin.com",
        },
        body: new URLSearchParams({ url }),
      });
      if (r.ok) {
        const d = await r.json().catch(() => null);
        const videoUrl = d?.url || d?.downloadUrl || d?.video_url;
        if (videoUrl) {
          console.log("[LISave] ✅ savelinkedin success");
          return NextResponse.json({
            type: "video",
            formats: [{ quality: "HD", url: videoUrl, label: "HD Quality" }],
            defaultUrl: videoUrl,
            thumbnail: d.thumbnail || null,
            title: d.title || "LinkedIn Video",
            author: d.author || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[LISave] savelinkedin failed:", e.message);
    }

    // ── STRATEGY E: linkedin-downloader.com ──
    try {
      console.log("[LISave] Trying linkedin-downloader.com...");
      const r = await fetch(
        `https://linkedin-downloader.com/api/download?url=${encodeURIComponent(url)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: "https://linkedin-downloader.com/",
            Accept: "application/json",
          },
        },
      );
      if (r.ok) {
        const d = await r.json();
        const videoUrl = d.video_url || d.url;
        if (videoUrl) {
          console.log("[LISave] ✅ linkedin-downloader success");
          return NextResponse.json({
            type: "video",
            formats: [{ quality: "HD", url: videoUrl, label: "HD Quality" }],
            defaultUrl: videoUrl,
            thumbnail: d.thumbnail || null,
            title: d.title || "LinkedIn Video",
            author: d.author || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[LISave] linkedin-downloader failed:", e.message);
    }

    // ── STRATEGY F: Image fallback ──
    // If we have HTML from scraping, look for images even if no video found
    if (bestHtml.length > 0) {
      const imageUrls = extractImageUrls(bestHtml);
      if (imageUrls.length > 0) {
        console.log("[LISave] ✅ Found image(s) — returning as image post");
        return NextResponse.json({
          type: "image",
          imageUrl: imageUrls[0],
          images: imageUrls.slice(0, 6), // return up to 6 for carousel posts
          thumbnail: imageUrls[0],
          title: extractOgTitle(bestHtml),
          author: extractAuthor(bestHtml),
          success: true,
        });
      }
    }

    console.log("[LISave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract media. LinkedIn requires posts to be public. If behind a login wall it cannot be downloaded.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[LISave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
