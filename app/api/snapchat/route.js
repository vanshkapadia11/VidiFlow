// app/api/snapchat/route.js
import { NextResponse } from "next/server";

function extractSnapInfo(url) {
  // Spotlight: https://www.snapchat.com/spotlight/...
  // Story: https://www.snapchat.com/add/username
  // Snap: https://story.snapchat.com/s/...
  // Short: https://t.snapchat.com/...

  const spotlightMatch = url.match(
    /snapchat\.com\/spotlight\/([a-zA-Z0-9_-]+)/,
  );
  if (spotlightMatch) return { type: "spotlight", id: spotlightMatch[1] };

  const storyMatch = url.match(/story\.snapchat\.com\/s\/([a-zA-Z0-9_-]+)/);
  if (storyMatch) return { type: "story", id: storyMatch[1] };

  const shortMatch = url.match(/t\.snapchat\.com\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return { type: "short", id: shortMatch[1] };

  return null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[SnapSave] Input URL:", url);

    // Resolve short URLs (t.snapchat.com)
    if (
      url.includes("t.snapchat.com") ||
      !url.includes("snapchat.com/spotlight")
    ) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
          },
        });
        url = res.url;
        console.log("[SnapSave] Resolved to:", url);
      } catch (e) {
        console.error("[SnapSave] Redirect failed:", e.message);
      }
    }

    // ── STRATEGY A: snapchat.com page scrape ──
    try {
      console.log("[SnapSave] Fetching Snapchat page...");
      const pageRes = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const html = await pageRes.text();
      console.log("[SnapSave] HTML length:", html.length);
      console.log("[SnapSave] Has video URL:", html.includes(".mp4"));

      // Look for video URLs in page source
      // Snapchat embeds video URLs in script tags and meta tags

      // Method A1: og:video meta tag
      const ogVideoMatch =
        html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/) ||
        html.match(/<meta\s+content="([^"]+)"\s+property="og:video"/) ||
        html.match(/<meta\s+property="og:video:url"\s+content="([^"]+)"/);

      if (ogVideoMatch) {
        const videoUrl = ogVideoMatch[1].replace(/&amp;/g, "&");
        console.log("[SnapSave] ✅ Found via og:video:", videoUrl);

        const thumbnail = extractOgImage(html);
        const title = extractOgTitle(html);

        return NextResponse.json({
          videoUrl,
          thumbnail,
          title,
          success: true,
          source: "og:video",
        });
      }

      // Method A2: Scan for .mp4 CDN URLs in raw HTML
      const mp4Patterns = [
        /https:\/\/[a-zA-Z0-9.\-_]+\.snapchat\.com\/[^\s"'<>]+\.mp4[^\s"'<>]*/g,
        /https:\/\/cf-st\.sc-cdn\.net\/[^\s"'<>]+\.mp4[^\s"'<>]*/g,
        /https:\/\/[^\s"'<>]+sc-cdn[^\s"'<>]+\.mp4[^\s"'<>]*/g,
        /https:\/\/[^\s"'<>]*snap[^\s"'<>]*\.mp4[^\s"'<>]*/gi,
      ];

      for (const pattern of mp4Patterns) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          const videoUrl = matches[0]
            .replace(/\\u002F/g, "/")
            .replace(/\\/g, "")
            .replace(/&amp;/g, "&");
          console.log("[SnapSave] ✅ Found via CDN scan:", videoUrl);

          return NextResponse.json({
            videoUrl,
            thumbnail: extractOgImage(html),
            title: extractOgTitle(html),
            success: true,
            source: "cdn_scan",
          });
        }
      }

      // Method A3: Look in JSON-LD or __NEXT_DATA__ script tags
      const nextDataMatch = html.match(
        /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
      );
      if (nextDataMatch) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          const str = JSON.stringify(nextData);

          const mp4Match = str.match(/https?:\\?\/\\?\/[^"\\]+\.mp4[^"\\]*/);
          if (mp4Match) {
            const videoUrl = mp4Match[0]
              .replace(/\\\//g, "/")
              .replace(/\\u002F/g, "/");
            console.log("[SnapSave] ✅ Found via __NEXT_DATA__:", videoUrl);

            return NextResponse.json({
              videoUrl,
              thumbnail: extractOgImage(html),
              title: extractOgTitle(html),
              success: true,
              source: "next_data",
            });
          }
        } catch (e) {
          console.error("[SnapSave] __NEXT_DATA__ parse failed:", e.message);
        }
      }

      // Method A4: Look in any script tag for video data
      const scriptBlocks =
        html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
      for (const block of scriptBlocks) {
        if (!block.includes(".mp4") && !block.includes("video")) continue;

        const mp4Match = block.match(
          /https?:\\?\/\\?\/[^\s"'\\<>]+\.mp4[^\s"'\\<>]*/,
        );
        if (mp4Match) {
          const videoUrl = mp4Match[0]
            .replace(/\\\//g, "/")
            .replace(/\\u002F/g, "/")
            .replace(/\\/g, "");
          if (videoUrl.startsWith("http")) {
            console.log("[SnapSave] ✅ Found via script scan:", videoUrl);
            return NextResponse.json({
              videoUrl,
              thumbnail: extractOgImage(html),
              title: extractOgTitle(html),
              success: true,
              source: "script_scan",
            });
          }
        }
      }

      // Even if no video found, return metadata so UI shows something
      const thumbnail = extractOgImage(html);
      const title = extractOgTitle(html);
      console.log("[SnapSave] No video URL found in HTML. Title:", title);
    } catch (e) {
      console.error("[SnapSave] Page scrape failed:", e.message);
    }

    // ── STRATEGY B: snapsave.app API (third-party) ──
    try {
      console.log("[SnapSave] Trying snapinsta/snapsave approach...");
      const formRes = await fetch("https://snapsave.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const formHtml = await formRes.text();
      const tokenMatch = formHtml.match(/name="_token"\s+value="([^"]+)"/);
      const cookies = formRes.headers.get("set-cookie") || "";

      if (tokenMatch) {
        const token = tokenMatch[1];
        const submitRes = await fetch("https://snapsave.app/action.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://snapsave.app/",
            Origin: "https://snapsave.app",
            Cookie: cookies,
          },
          body: new URLSearchParams({ url, _token: token }),
        });

        if (submitRes.ok) {
          const resultHtml = await submitRes.text();
          const videoMatch = resultHtml.match(
            /href="(https:\/\/[^"]+\.mp4[^"]*)"/,
          );
          if (videoMatch) {
            console.log("[SnapSave] ✅ snapsave.app success");
            const thumbMatch = resultHtml.match(
              /src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/,
            );
            return NextResponse.json({
              videoUrl: videoMatch[1].replace(/&amp;/g, "&"),
              thumbnail: thumbMatch ? thumbMatch[1] : null,
              title: "Snapchat Video",
              success: true,
              source: "snapsave",
            });
          }
        }
      }
    } catch (e) {
      console.error("[SnapSave] snapsave.app failed:", e.message);
    }

    // ── STRATEGY C: snapsave.io API ──
    try {
      console.log("[SnapSave] Trying snapsave.io...");
      const ssRes = await fetch("https://snapsave.io/action.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://snapsave.io/",
          Origin: "https://snapsave.io",
        },
        body: new URLSearchParams({ url }),
      });

      if (ssRes.ok) {
        const ssHtml = await ssRes.text();
        const videoMatch = ssHtml.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
        if (videoMatch) {
          console.log("[SnapSave] ✅ snapsave.io success");
          return NextResponse.json({
            videoUrl: videoMatch[1].replace(/&amp;/g, "&"),
            thumbnail: null,
            title: "Snapchat Video",
            success: true,
            source: "snapsave.io",
          });
        }
      }
    } catch (e) {
      console.error("[SnapSave] snapsave.io failed:", e.message);
    }

    console.log("[SnapSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. Make sure the Snapchat link is public (Spotlight or public Story).",
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

function extractOgImage(html) {
  const match =
    html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/) ||
    html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/);
  return match ? match[1].replace(/&amp;/g, "&") : null;
}

function extractOgTitle(html) {
  const match =
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) ||
    html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/) ||
    html.match(/<title>([^<]+)<\/title>/);
  return match
    ? match[1].replace(/&amp;/g, "&").replace(" | Snapchat", "").trim()
    : "Snapchat Video";
}
