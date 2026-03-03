// app/api/facebook/route.js
import { NextResponse } from "next/server";

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\u0025/g, "%")
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/");
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[FBSave] Input URL:", url);

    // Normalize Facebook URLs
    // Handle fb.watch short links
    if (url.includes("fb.watch") || url.includes("fb.me")) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        url = res.url;
        console.log("[FBSave] Resolved to:", url);
      } catch (e) {
        console.error("[FBSave] Redirect failed:", e.message);
      }
    }

    // ── STRATEGY A: Fetch Facebook page and parse embedded data ──
    let html = "";
    try {
      console.log("[FBSave] Fetching Facebook page...");

      // Try mobile first — Facebook serves less JS on mobile
      const mobileRes = await fetch(
        url.replace("www.facebook.com", "m.facebook.com"),
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
          },
        },
      );

      html = await mobileRes.text();
      console.log("[FBSave] HTML length:", html.length);
      console.log("[FBSave] Has video:", html.includes(".mp4"));
      console.log("[FBSave] Has image:", html.includes("fbcdn.net"));
    } catch (e) {
      console.error("[FBSave] Page fetch failed:", e.message);
    }

    // A1: Look for HD video URL
    if (html.includes(".mp4")) {
      // HD video
      const hdPatterns = [
        /hd_src["']?\s*:\s*["']([^"']+\.mp4[^"']*)/,
        /"hd_src_no_ratelimit":\s*"([^"]+)"/,
        /hd_src_no_ratelimit["']?\s*:\s*["']([^"']+)/,
        /"playable_url_quality_hd":\s*"([^"]+)"/,
        /playable_url_quality_hd["']?\s*:\s*["']([^"']+)/,
      ];

      for (const pattern of hdPatterns) {
        const match = html.match(pattern);
        if (match) {
          const videoUrl = decodeEntities(match[1]);
          console.log("[FBSave] ✅ Found HD video:", videoUrl.substring(0, 80));

          // Also try to find SD as fallback
          let sdUrl = null;
          const sdPatterns = [
            /sd_src["']?\s*:\s*["']([^"']+\.mp4[^"']*)/,
            /"sd_src_no_ratelimit":\s*"([^"]+)"/,
            /"playable_url":\s*"([^"]+)"/,
          ];
          for (const sdPattern of sdPatterns) {
            const sdMatch = html.match(sdPattern);
            if (sdMatch) {
              sdUrl = decodeEntities(sdMatch[1]);
              break;
            }
          }

          const thumbnail = extractFBThumbnail(html);
          const title = extractFBTitle(html);

          return NextResponse.json({
            type: "video",
            hdUrl: videoUrl,
            sdUrl: sdUrl,
            defaultUrl: videoUrl,
            thumbnail,
            title,
            success: true,
          });
        }
      }

      // SD video fallback
      const sdPatterns = [
        /sd_src["']?\s*:\s*["']([^"']+\.mp4[^"']*)/,
        /"sd_src_no_ratelimit":\s*"([^"]+)"/,
        /"playable_url":\s*"([^"]+)"/,
        /playable_url["']?\s*:\s*["']([^"']+)/,
      ];

      for (const pattern of sdPatterns) {
        const match = html.match(pattern);
        if (match) {
          const videoUrl = decodeEntities(match[1]);
          console.log("[FBSave] ✅ Found SD video:", videoUrl.substring(0, 80));

          return NextResponse.json({
            type: "video",
            hdUrl: null,
            sdUrl: videoUrl,
            defaultUrl: videoUrl,
            thumbnail: extractFBThumbnail(html),
            title: extractFBTitle(html),
            success: true,
          });
        }
      }

      // Brute force: any .mp4 CDN URL
      const bruteMp4 = html.match(
        /https:\/\/video[^\s"'\\<>]+\.mp4[^\s"'\\<>]*/,
      );
      if (bruteMp4) {
        const videoUrl = decodeEntities(bruteMp4[0]);
        console.log(
          "[FBSave] ✅ Found via brute scan:",
          videoUrl.substring(0, 80),
        );
        return NextResponse.json({
          type: "video",
          hdUrl: null,
          sdUrl: videoUrl,
          defaultUrl: videoUrl,
          thumbnail: extractFBThumbnail(html),
          title: extractFBTitle(html),
          success: true,
        });
      }
    }

    // A2: Image download
    if (html.includes("fbcdn.net")) {
      // High-res image from Facebook CDN
      const imagePatterns = [
        /"image":\{"uri":"([^"]+fbcdn\.net[^"]+)"/,
        /property="og:image"\s+content="([^"]+fbcdn\.net[^"]+)"/,
        /content="([^"]+fbcdn\.net[^"]+)"\s+property="og:image"/,
        /"url":"(https:\/\/[^"]+fbcdn\.net[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/,
      ];

      for (const pattern of imagePatterns) {
        const match = html.match(pattern);
        if (match) {
          const imageUrl = decodeEntities(match[1]);
          if (imageUrl.includes("fbcdn.net")) {
            console.log("[FBSave] ✅ Found image:", imageUrl.substring(0, 80));
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
    }

    // ── STRATEGY B: fdownloader.net API ──
    try {
      console.log("[FBSave] Trying fdownloader.net...");
      const fdRes = await fetch("https://fdownloader.net/api/ajaxSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://fdownloader.net/",
          Origin: "https://fdownloader.net",
        },
        body: new URLSearchParams({ q: url, lang: "en" }),
      });

      if (fdRes.ok) {
        const fdData = await fdRes.json();
        console.log("[FBSave] fdownloader status:", fdData.status);

        if (fdData.status === "ok" && fdData.data) {
          const html2 = fdData.data;
          // Parse download links from returned HTML
          const hdMatch = html2.match(/href="([^"]+)"[^>]*>.*?HD/i);
          const sdMatch = html2.match(/href="([^"]+)"[^>]*>.*?SD/i);
          const thumbMatch = html2.match(/<img[^>]+src="([^"]+)"/);

          if (hdMatch || sdMatch) {
            console.log("[FBSave] ✅ fdownloader success");
            return NextResponse.json({
              type: "video",
              hdUrl: hdMatch ? hdMatch[1].replace(/&amp;/g, "&") : null,
              sdUrl: sdMatch ? sdMatch[1].replace(/&amp;/g, "&") : null,
              defaultUrl: (hdMatch || sdMatch)[1].replace(/&amp;/g, "&"),
              thumbnail: thumbMatch ? thumbMatch[1] : null,
              title: "Facebook Video",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[FBSave] fdownloader failed:", e.message);
    }

    // ── STRATEGY C: getfvid.com API ──
    try {
      console.log("[FBSave] Trying getfvid.com...");
      const gfRes = await fetch("https://www.getfvid.com/downloader", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://www.getfvid.com/",
          Origin: "https://www.getfvid.com",
        },
        body: new URLSearchParams({ url }),
      });

      if (gfRes.ok) {
        const gfHtml = await gfRes.text();
        const hdMatch = gfHtml.match(
          /href="(https:\/\/[^"]+\.mp4[^"]*)"[^>]*>.*?[Hh][Dd]/,
        );
        const sdMatch = gfHtml.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);

        if (hdMatch || sdMatch) {
          console.log("[FBSave] ✅ getfvid success");
          const videoUrl = (hdMatch || sdMatch)[1].replace(/&amp;/g, "&");
          return NextResponse.json({
            type: "video",
            hdUrl: hdMatch ? hdMatch[1].replace(/&amp;/g, "&") : null,
            sdUrl: sdMatch ? sdMatch[1].replace(/&amp;/g, "&") : null,
            defaultUrl: videoUrl,
            thumbnail: null,
            title: "Facebook Video",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[FBSave] getfvid failed:", e.message);
    }

    // ── STRATEGY D: savefrom.net ──
    try {
      console.log("[FBSave] Trying savefrom.net...");
      const sfRes = await fetch("https://worker.sf-tools.com/savefrom.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://en.savefrom.net/",
          Origin: "https://en.savefrom.net",
        },
        body: new URLSearchParams({ sf_url: url, new_design: "1" }),
      });

      if (sfRes.ok) {
        const sfData = await sfRes.json();
        if (sfData?.url?.length > 0) {
          const videos = sfData.url.filter(
            (f) => f.url && (f.ext === "mp4" || f.url.includes(".mp4")),
          );
          if (videos.length > 0) {
            const hd = videos.find(
              (v) => v.quality?.includes("HD") || v.quality?.includes("720"),
            );
            const sd = videos[0];
            console.log("[FBSave] ✅ savefrom success");
            return NextResponse.json({
              type: "video",
              hdUrl: hd?.url || null,
              sdUrl: sd?.url || null,
              defaultUrl: (hd || sd).url,
              thumbnail: sfData.thumb || null,
              title: sfData.meta?.title || "Facebook Video",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[FBSave] savefrom failed:", e.message);
    }

    console.log("[FBSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract media. Make sure the post is public and the URL is correct.",
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

function extractFBThumbnail(html) {
  const patterns = [
    /property="og:image"\s+content="([^"]+)"/,
    /content="([^"]+)"\s+property="og:image"/,
    /"thumbnailImage":\{"uri":"([^"]+)"/,
    /"preferred_thumbnail":\{"image":\{"uri":"([^"]+)"/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeEntities(match[1]);
  }
  return null;
}

function extractFBTitle(html) {
  const patterns = [
    /property="og:title"\s+content="([^"]+)"/,
    /content="([^"]+)"\s+property="og:title"/,
    /<title>([^<]+)<\/title>/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match)
      return decodeEntities(match[1]).replace(" | Facebook", "").trim();
  }
  return "Facebook Video";
}
