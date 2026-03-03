// app/api/instagram/route.js
import { NextResponse } from "next/server";

function extractInstagramInfo(url) {
  // Reel: https://www.instagram.com/reel/ABC123/
  const reelMatch = url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/);
  if (reelMatch) return { type: "reel", id: reelMatch[1] };

  // Post: https://www.instagram.com/p/ABC123/
  const postMatch = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
  if (postMatch) return { type: "post", id: postMatch[1] };

  // TV: https://www.instagram.com/tv/ABC123/
  const tvMatch = url.match(/instagram\.com\/tv\/([a-zA-Z0-9_-]+)/);
  if (tvMatch) return { type: "tv", id: tvMatch[1] };

  // Stories: https://www.instagram.com/stories/username/123/
  const storyMatch = url.match(/instagram\.com\/stories\/([^/]+)\/(\d+)/);
  if (storyMatch)
    return { type: "story", username: storyMatch[1], id: storyMatch[2] };

  return null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    // Remove query params and trailing slash for cleaner URL
    url = url.split("?")[0].replace(/\/$/, "") + "/";
    console.log("[IGSave] Input URL:", url);

    const info = extractInstagramInfo(url);
    console.log("[IGSave] Parsed info:", info);

    if (!info) {
      return NextResponse.json(
        { error: "Invalid Instagram URL. Paste a post, reel, or TV link." },
        { status: 400 },
      );
    }

    // ── STRATEGY A: snapinsta.app (most reliable third-party) ──
    try {
      console.log("[IGSave] Trying snapinsta.app...");
      const siRes = await fetch("https://snapinsta.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const siHtml = await siRes.text();
      const tokenMatch =
        siHtml.match(/name="token"\s+value="([^"]+)"/) ||
        siHtml.match(/"token"\s*:\s*"([^"]+)"/);
      const cookies = siRes.headers.get("set-cookie") || "";

      if (tokenMatch) {
        console.log("[IGSave] snapinsta token found");
        const submitRes = await fetch("https://snapinsta.app/action.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://snapinsta.app/",
            Origin: "https://snapinsta.app",
            Cookie: cookies,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            url: url.replace(/\/$/, ""),
            token: tokenMatch[1],
          }),
        });

        if (submitRes.ok) {
          const resultHtml = await submitRes.text();
          console.log("[IGSave] snapinsta result length:", resultHtml.length);

          // Parse media items from result HTML
          const mediaItems = parseSnapinstaResult(resultHtml);
          if (mediaItems.length > 0) {
            console.log(
              "[IGSave] ✅ snapinsta success, items:",
              mediaItems.length,
            );
            return NextResponse.json({
              type: info.type,
              shortcode: info.id,
              mediaItems,
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[IGSave] snapinsta failed:", e.message);
    }

    // ── STRATEGY B: Instagram oEmbed API (for metadata + thumbnail) ──
    let oembedData = null;
    try {
      console.log("[IGSave] Trying Instagram oEmbed...");
      const oembedRes = await fetch(
        `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&format=json`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );
      if (oembedRes.ok) {
        oembedData = await oembedRes.json();
        console.log("[IGSave] oEmbed title:", oembedData.title);
      }
    } catch (e) {}

    // ── STRATEGY C: igram.world ──
    try {
      console.log("[IGSave] Trying igram.world...");
      const igRes = await fetch("https://igram.world/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://igram.world/",
          Origin: "https://igram.world",
        },
        body: JSON.stringify({ url: url.replace(/\/$/, "") }),
      });

      if (igRes.ok) {
        const igData = await igRes.json();
        console.log(
          "[IGSave] igram response:",
          JSON.stringify(igData).substring(0, 300),
        );

        if (igData.media && igData.media.length > 0) {
          const mediaItems = igData.media
            .map((item, i) => ({
              type: item.type || "video",
              url: item.url || item.download_url,
              thumbnail: item.thumbnail || item.cover || null,
              quality: item.quality || "HD",
              index: i,
            }))
            .filter((m) => m.url);

          if (mediaItems.length > 0) {
            console.log("[IGSave] ✅ igram success");
            return NextResponse.json({
              type: info.type,
              shortcode: info.id,
              mediaItems,
              title: igData.caption || oembedData?.title || "Instagram Post",
              author: igData.author || oembedData?.author_name || "",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[IGSave] igram failed:", e.message);
    }

    // ── STRATEGY D: Instagram page scrape ──
    try {
      console.log("[IGSave] Trying Instagram page scrape...");
      const pageRes = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: "ig_did=1; csrftoken=1;",
        },
      });

      const html = await pageRes.text();
      console.log("[IGSave] HTML length:", html.length);

      // Look for video_url in embedded JSON
      const videoPatterns = [
        /"video_url"\s*:\s*"([^"]+)"/g,
        /"playback_url"\s*:\s*"([^"]+)"/g,
        /property="og:video"\s+content="([^"]+)"/,
        /content="([^"]+)"\s+property="og:video"/,
      ];

      const videoUrls = [];
      for (const pattern of videoPatterns) {
        if (pattern.global) {
          const matches = [...html.matchAll(pattern)];
          matches.forEach((m) => {
            const u = m[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
            if (u.startsWith("http")) videoUrls.push(u);
          });
        } else {
          const m = html.match(pattern);
          if (m) {
            const u = m[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
            if (u.startsWith("http")) videoUrls.push(u);
          }
        }
      }

      // Also look for image URLs
      const imagePatterns = [
        /"display_url"\s*:\s*"([^"]+)"/g,
        /property="og:image"\s+content="([^"]+)"/,
      ];

      const imageUrls = [];
      for (const pattern of imagePatterns) {
        if (pattern.global) {
          const matches = [...html.matchAll(pattern)];
          matches.forEach((m) => {
            const u = m[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
            if (u.startsWith("http") && u.includes("cdninstagram"))
              imageUrls.push(u);
          });
        } else {
          const m = html.match(pattern);
          if (m) {
            const u = m[1].replace(/&amp;/g, "&");
            if (u.startsWith("http")) imageUrls.push(u);
          }
        }
      }

      if (videoUrls.length > 0 || imageUrls.length > 0) {
        const mediaItems = [
          ...videoUrls.slice(0, 5).map((u, i) => ({
            type: "video",
            url: u,
            thumbnail: imageUrls[i] || null,
            index: i,
          })),
          ...imageUrls.slice(videoUrls.length, 5).map((u, i) => ({
            type: "image",
            url: u,
            thumbnail: u,
            index: videoUrls.length + i,
          })),
        ];

        if (mediaItems.length > 0) {
          console.log("[IGSave] ✅ page scrape success");
          const titleMatch =
            html.match(/property="og:title"\s+content="([^"]+)"/) ||
            html.match(/content="([^"]+)"\s+property="og:title"/);
          return NextResponse.json({
            type: info.type,
            shortcode: info.id,
            mediaItems,
            title: titleMatch
              ? titleMatch[1].replace(/&amp;/g, "&")
              : oembedData?.title || "Instagram Post",
            author: oembedData?.author_name || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[IGSave] page scrape failed:", e.message);
    }

    // ── STRATEGY E: RapidAPI Instagram downloader ──
    if (process.env.RAPIDAPI_KEY) {
      try {
        console.log("[IGSave] Trying RapidAPI...");
        const rapidRes = await fetch(
          `https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host":
                "instagram-downloader-download-instagram-videos-stories.p.rapidapi.com",
            },
          },
        );

        if (rapidRes.ok) {
          const rapidData = await rapidRes.json();
          console.log(
            "[IGSave] RapidAPI response:",
            JSON.stringify(rapidData).substring(0, 300),
          );

          const mediaItems = [];
          if (rapidData.media) {
            if (Array.isArray(rapidData.media)) {
              rapidData.media.forEach((item, i) => {
                mediaItems.push({
                  type: item.type || "video",
                  url: item.url,
                  thumbnail: item.thumbnail || null,
                  index: i,
                });
              });
            } else {
              mediaItems.push({
                type: "video",
                url: rapidData.media,
                thumbnail: rapidData.thumbnail || null,
                index: 0,
              });
            }
          } else if (rapidData.url) {
            mediaItems.push({
              type: "video",
              url: rapidData.url,
              thumbnail: rapidData.thumbnail || null,
              index: 0,
            });
          }

          if (mediaItems.length > 0) {
            console.log("[IGSave] ✅ RapidAPI success");
            return NextResponse.json({
              type: info.type,
              shortcode: info.id,
              mediaItems,
              title: rapidData.caption || oembedData?.title || "Instagram Post",
              author: rapidData.author || oembedData?.author_name || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[IGSave] RapidAPI failed:", e.message);
      }
    }

    console.log("[IGSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error: "Could not extract media. Make sure the post is public.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[IGSave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}

function parseSnapinstaResult(html) {
  const items = [];

  // Video items
  const videoMatches = [
    ...html.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/g),
  ];
  videoMatches.forEach((m, i) => {
    items.push({ type: "video", url: m[1].replace(/&amp;/g, "&"), index: i });
  });

  // Image items
  const imgMatches = [
    ...html.matchAll(
      /<img[^>]+src="(https:\/\/[^"]+cdninstagram[^"]+)"[^>]*>/g,
    ),
  ];
  imgMatches.forEach((m, i) => {
    // Only add if not already a video thumbnail
    if (!items.some((item) => item.thumbnail === m[1])) {
      items.push({
        type: "image",
        url: m[1].replace(/&amp;/g, "&"),
        thumbnail: m[1],
        index: items.length,
      });
    }
  });

  // Download links in result
  const dlMatches = [
    ...html.matchAll(
      /href="(https:\/\/[^"]+)"[^>]*class="[^"]*download[^"]*"/g,
    ),
  ];
  dlMatches.forEach((m, i) => {
    const url = m[1].replace(/&amp;/g, "&");
    if (!items.some((item) => item.url === url)) {
      const isVideo = url.includes(".mp4") || url.includes("video");
      items.push({
        type: isVideo ? "video" : "image",
        url,
        index: items.length,
      });
    }
  });

  return items;
}
