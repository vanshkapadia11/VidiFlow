// app/api/facebook/route.js
import { NextResponse } from "next/server";

// Deep decode — Facebook encodes URLs multiple times
function deepDecode(str) {
  if (!str) return "";
  let result = str;
  // Multiple rounds of decoding
  for (let i = 0; i < 3; i++) {
    result = result
      .replace(/\\u002F/gi, "/")
      .replace(/\\u0026/gi, "&")
      .replace(/\\u003C/gi, "<")
      .replace(/\\u003E/gi, ">")
      .replace(/\\u0025/gi, "%")
      .replace(/\\\//g, "/")
      .replace(/\\"/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
  }
  return result.trim();
}

function extractFBThumbnail(html) {
  const patterns = [
    /property="og:image"\s+content="([^"]+)"/,
    /content="([^"]+)"\s+property="og:image"/,
    /"thumbnailImage":\{"uri":"([^"]+)"/,
    /"preferred_thumbnail":\{"image":\{"uri":"([^"]+)"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return deepDecode(m[1]);
  }
  return null;
}

function extractFBTitle(html) {
  const patterns = [
    /property="og:title"\s+content="([^"]+)"/,
    /content="([^"]+)"\s+property="og:title"/,
    /<title>([^<]+)<\/title>/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m)
      return deepDecode(m[1])
        .replace(/ \| Facebook$/, "")
        .trim();
  }
  return "Facebook Video";
}

// Defined here so extractVideoUrls can reference it
const innerPatterns = [
  /"playable_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
  /"hd_src"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
  /"sd_src"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
];

// The key function — extract ALL mp4 URLs from the raw HTML using multiple approaches
function extractVideoUrls(html) {
  const candidates = new Set();

  // 1. Direct JSON key extraction — these are the most reliable
  const jsonKeyPatterns = [
    /"hd_src"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"hd_src_no_ratelimit"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"sd_src"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"sd_src_no_ratelimit"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"playable_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"playable_url_quality_hd"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"browser_native_hd_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"browser_native_sd_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"video_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"src"\s*:\s*"((?:[^"\\]|\\.)*\.mp4(?:[^"\\]|\\.)*)"/g,
  ];

  for (const pattern of jsonKeyPatterns) {
    const matches = [...html.matchAll(pattern)];
    for (const m of matches) {
      const decoded = deepDecode(m[1]);
      if (decoded.startsWith("http") && decoded.includes(".mp4")) {
        candidates.add(decoded);
      }
    }
  }

  // 2. Scan for raw escaped Facebook CDN video URLs
  // Facebook stores them like: https:\/\/video.xx.fbcdn.net\/...
  const escapedUrlPattern = /https?:\\u002F\\u002F[^"'\s\\]+?\.mp4[^"'\s]*/gi;
  const escapedMatches = [...html.matchAll(escapedUrlPattern)];
  for (const m of escapedMatches) {
    candidates.add(deepDecode(m[0]));
  }

  // 3. Scan for backslash-escaped URLs
  const backslashPattern =
    /https?:\/\/(?:video|scontent)[^"'\s]*?\.mp4[^"'\s]*/gi;
  const backslashMatches = [...html.matchAll(backslashPattern)];
  for (const m of backslashMatches) {
    candidates.add(deepDecode(m[0]));
  }

  // 4. Parse __bbox / require JSON chunks — Facebook bundles video data here
  const bboxMatches = [...html.matchAll(/"__bbox":\{([\s\S]{1,50000}?)\}/g)];
  for (const bbox of bboxMatches) {
    const chunk = bbox[1];
    if (chunk.includes("mp4") || chunk.includes("playable")) {
      const innerMatterns = [
        /"playable_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
        /"hd_src"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
        /"sd_src"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      ];
      for (const ip of innerPatterns) {
        const innerMatches = [...chunk.matchAll(ip)];
        for (const im of innerMatches) {
          const decoded = deepDecode(im[1]);
          if (decoded.startsWith("http")) candidates.add(decoded);
        }
      }
    }
  }

  // 5. Look inside script tags for video data
  const scriptMatches = [
    ...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  for (const script of scriptMatches) {
    const content = script[1];
    if (!content.includes("mp4") && !content.includes("fbcdn")) continue;

    const scriptPatterns = [
      /"(https:\/\/video[^"\\]*(?:\\.[^"\\])*\.mp4[^"\\]*)"/g,
      /"(https:\/\/[^"\\]*fbcdn\.net[^"\\]*\.mp4[^"\\]*)"/g,
    ];
    for (const sp of scriptPatterns) {
      const sMatches = [...content.matchAll(sp)];
      for (const sm of sMatches) {
        candidates.add(deepDecode(sm[1]));
      }
    }
  }

  // Filter: only valid Facebook CDN video URLs
  const validUrls = [...candidates].filter((u) => {
    try {
      const parsed = new URL(u);
      return (
        parsed.protocol === "https:" &&
        (parsed.hostname.includes("fbcdn.net") ||
          parsed.hostname.includes("facebook.com") ||
          parsed.hostname.includes("cdninstagram.com")) &&
        u.includes(".mp4")
      );
    } catch {
      return false;
    }
  });

  // Deduplicate by stripping query params for comparison
  const seen = new Set();
  const deduped = [];
  for (const u of validUrls) {
    try {
      const key = new URL(u).pathname;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(u);
      }
    } catch {
      deduped.push(u);
    }
  }

  return deduped;
}

// Classify URLs as HD or SD based on URL patterns and query params
function classifyVideoUrls(urls) {
  let hdUrl = null;
  let sdUrl = null;

  for (const u of urls) {
    const lowerU = u.toLowerCase();
    const isHD =
      lowerU.includes("hd") ||
      lowerU.includes("720") ||
      lowerU.includes("1080") ||
      lowerU.includes("high") ||
      (lowerU.includes("vbr=") &&
        parseInt(u.match(/vbr=(\d+)/)?.[1] || "0") > 1000000);

    if (isHD && !hdUrl) hdUrl = u;
    else if (!isHD && !sdUrl) sdUrl = u;
  }

  // If we only found one, put it in both
  if (hdUrl && !sdUrl) sdUrl = null;
  if (!hdUrl && sdUrl) {
    hdUrl = null;
  }
  // If we have multiple and couldn't classify, use first as HD, second as SD
  if (!hdUrl && !sdUrl && urls.length > 0) {
    hdUrl = urls.length > 1 ? urls[0] : null;
    sdUrl = urls.length > 1 ? urls[1] : urls[0];
  }

  return { hdUrl, sdUrl, defaultUrl: hdUrl || sdUrl };
}

async function resolveFbShortLink(url) {
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
    console.log("[FBSave] Input URL:", url);

    if (
      url.includes("fb.watch") ||
      url.includes("fb.me") ||
      url.includes("fb.gg")
    ) {
      url = await resolveFbShortLink(url);
      console.log("[FBSave] Resolved:", url);
    }

    // ── STRATEGY A: RapidAPI — most reliable ──
    if (process.env.RAPIDAPI_KEY) {
      // A1: facebook-video-downloader2
      try {
        console.log("[FBSave] Trying RapidAPI facebook-video-downloader2...");
        const r = await fetch(
          `https://facebook-video-downloader2.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "facebook-video-downloader2.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const d = await r.json();
          console.log(
            "[FBSave] RapidAPI A1:",
            JSON.stringify(d).substring(0, 300),
          );
          const hd = d.hd || d.HD || d["720p"] || null;
          const sd = d.sd || d.SD || d["480p"] || d["360p"] || null;
          if (hd || sd) {
            console.log("[FBSave] ✅ A1 success");
            return NextResponse.json({
              type: "video",
              hdUrl: hd,
              sdUrl: sd,
              defaultUrl: hd || sd,
              thumbnail: d.thumbnail || null,
              title: d.title || "Facebook Video",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[FBSave] A1 failed:", e.message);
      }

      // A2: social-media-video-downloader
      try {
        console.log("[FBSave] Trying RapidAPI SMVD...");
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
          console.log("[FBSave] SMVD:", JSON.stringify(d).substring(0, 300));
          if (d.success && d.links?.length > 0) {
            const hd = d.links.find(
              (l) =>
                l.quality?.toLowerCase().includes("hd") ||
                l.quality?.includes("720"),
            );
            const sd = d.links.find(
              (l) =>
                l.quality?.toLowerCase().includes("sd") ||
                l.quality?.includes("360"),
            );
            const best = hd || sd || d.links[0];
            console.log("[FBSave] ✅ SMVD success");
            return NextResponse.json({
              type: "video",
              hdUrl: hd?.link || null,
              sdUrl: sd?.link || null,
              defaultUrl: best.link,
              thumbnail: d.picture || null,
              title: d.title || "Facebook Video",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[FBSave] SMVD failed:", e.message);
      }
    }

    // ── STRATEGY B: fdown.net ──
    try {
      console.log("[FBSave] Trying fdown.net...");
      const init = await fetch("https://fdown.net/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const initHtml = await init.text();
      const tok =
        initHtml.match(/name="_token"\s+value="([^"]+)"/) ||
        initHtml.match(/name="token"\s+value="([^"]+)"/);
      const cookies = init.headers.get("set-cookie") || "";
      if (tok) {
        const form = await fetch("https://fdown.net/download.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://fdown.net/",
            Origin: "https://fdown.net",
            Cookie: cookies,
          },
          body: new URLSearchParams({ URLz: url, _token: tok[1] }),
        });
        if (form.ok) {
          const html = await form.text();
          const hd = html.match(/id="hdlink"[^>]*href="([^"]+)"/);
          const sd = html.match(/id="sdlink"[^>]*href="([^"]+)"/);
          if (hd || sd) {
            console.log("[FBSave] ✅ fdown.net success");
            return NextResponse.json({
              type: "video",
              hdUrl: hd ? hd[1].replace(/&amp;/g, "&") : null,
              sdUrl: sd ? sd[1].replace(/&amp;/g, "&") : null,
              defaultUrl: (hd || sd)[1].replace(/&amp;/g, "&"),
              thumbnail: null,
              title: "Facebook Video",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[FBSave] fdown.net failed:", e.message);
    }

    // ── STRATEGY C: Deep page scrape with aggressive URL extraction ──
    const attempts = [
      {
        url,
        ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      {
        url: url.replace("www.facebook.com", "m.facebook.com"),
        ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      },
      {
        url,
        ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    ];

    for (const attempt of attempts) {
      try {
        console.log(
          `[FBSave] Scraping with UA: ${attempt.ua.substring(0, 40)}...`,
        );
        const r = await fetch(attempt.url, {
          headers: {
            "User-Agent": attempt.ua,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const html = await r.text();
        console.log(
          `[FBSave] HTML length: ${html.length}, has mp4: ${html.includes(".mp4")}, has fbcdn: ${html.includes("fbcdn.net")}`,
        );

        if (html.includes(".mp4") || html.includes("fbcdn.net")) {
          const videoUrls = extractVideoUrls(html);
          console.log(`[FBSave] Found ${videoUrls.length} video URLs`);

          if (videoUrls.length > 0) {
            const { hdUrl, sdUrl, defaultUrl } = classifyVideoUrls(videoUrls);
            console.log(
              "[FBSave] ✅ Page scrape success — HD:",
              hdUrl?.substring(0, 60),
              "SD:",
              sdUrl?.substring(0, 60),
            );
            return NextResponse.json({
              type: "video",
              hdUrl,
              sdUrl,
              defaultUrl,
              thumbnail: extractFBThumbnail(html),
              title: extractFBTitle(html),
              success: true,
            });
          }

          // No video found — check for image
          const imagePatterns = [
            /property="og:image"\s+content="([^"]+fbcdn\.net[^"]+)"/,
            /content="([^"]+fbcdn\.net[^"]+)"\s+property="og:image"/,
          ];
          for (const p of imagePatterns) {
            const m = html.match(p);
            if (m) {
              const imageUrl = deepDecode(m[1]);
              console.log("[FBSave] ✅ Found image");
              return NextResponse.json({
                type: "image",
                imageUrl,
                thumbnail: imageUrl,
                title: extractFBTitle(html),
                success: true,
              });
            }
          }
        }
      } catch (e) {
        console.error(`[FBSave] Scrape failed:`, e.message);
      }
    }

    // ── STRATEGY D: getfvid.com ──
    try {
      console.log("[FBSave] Trying getfvid.com...");
      const r = await fetch("https://www.getfvid.com/downloader", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Referer: "https://www.getfvid.com/",
          Origin: "https://www.getfvid.com",
        },
        body: new URLSearchParams({ url }),
      });
      if (r.ok) {
        const html = await r.text();
        const allMp4 = [
          ...html.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/g),
        ].map((m) => m[1].replace(/&amp;/g, "&"));
        if (allMp4.length > 0) {
          console.log("[FBSave] ✅ getfvid success");
          return NextResponse.json({
            type: "video",
            hdUrl: allMp4[0],
            sdUrl: allMp4[1] || null,
            defaultUrl: allMp4[0],
            thumbnail: null,
            title: "Facebook Video",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[FBSave] getfvid failed:", e.message);
    }

    console.log("[FBSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. Make sure the post is public. Add RAPIDAPI_KEY to .env.local for more reliable results.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[FBSave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
