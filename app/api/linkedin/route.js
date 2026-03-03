// app/api/linkedin/route.js
import { NextResponse } from "next/server";

function extractLinkedInInfo(url) {
  // Post: https://www.linkedin.com/posts/username_activity-123456789-xxxx
  // Feed: https://www.linkedin.com/feed/update/urn:li:activity:123456789
  // Share: https://www.linkedin.com/share/...
  // Short: https://lnkd.in/...

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

  // If URL contains linkedin.com at all, try anyway
  if (url.includes("linkedin.com")) return { type: "unknown", id: null };

  return null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[LISave] Input URL:", url);

    // Resolve short links (lnkd.in)
    if (url.includes("lnkd.in") || !url.includes("linkedin.com")) {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        url = res.url;
        console.log("[LISave] Resolved to:", url);
      } catch (e) {
        console.error("[LISave] Redirect failed:", e.message);
      }
    }

    const info = extractLinkedInInfo(url);
    console.log("[LISave] Parsed info:", info);

    if (!info) {
      return NextResponse.json(
        {
          error:
            "Invalid LinkedIn URL. Please paste a LinkedIn post or video link.",
        },
        { status: 400 },
      );
    }

    // ── STRATEGY A: Fetch LinkedIn page and parse embedded video data ──
    let html = "";
    try {
      console.log("[LISave] Fetching LinkedIn page...");

      // Try with a realistic browser UA
      const pageRes = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
      });

      html = await pageRes.text();
      console.log("[LISave] HTML length:", html.length);
      console.log(
        "[LISave] Has video:",
        html.includes(".mp4") || html.includes("data-sources"),
      );
    } catch (e) {
      console.error("[LISave] Page fetch failed:", e.message);
    }

    if (html.length > 0) {
      // A1: Look for data-sources attribute (LinkedIn's video player attribute)
      const dataSourcesMatch = html.match(/data-sources="([^"]+)"/);
      if (dataSourcesMatch) {
        try {
          const sources = JSON.parse(
            dataSourcesMatch[1].replace(/&quot;/g, '"'),
          );
          if (Array.isArray(sources) && sources.length > 0) {
            const formats = sources
              .filter((s) => s.src)
              .map((s) => ({
                quality: s.data?.progressiveResolution || s.quality || "HD",
                url: s.src,
                label: s.data?.progressiveResolution
                  ? `${s.data.progressiveResolution}p`
                  : "HD",
              }));

            if (formats.length > 0) {
              console.log("[LISave] ✅ Found via data-sources");
              return NextResponse.json({
                formats,
                defaultUrl: formats[0].url,
                thumbnail: extractOgImage(html),
                title: extractOgTitle(html),
                author: extractAuthor(html),
                success: true,
              });
            }
          }
        } catch (e) {
          console.error("[LISave] data-sources parse failed:", e.message);
        }
      }

      // A2: Look for progressiveUrl in JSON blobs
      const progressivePatterns = [
        /"progressiveUrl"\s*:\s*"([^"]+)"/g,
        /"streamingLocations"\s*:\s*\[[\s\S]*?"url"\s*:\s*"([^"]+\.mp4[^"]*)"/g,
        /data-media-url="([^"]+\.mp4[^"]*)"/g,
      ];

      for (const pattern of progressivePatterns) {
        const matches = [...html.matchAll(pattern)];
        if (matches.length > 0) {
          const videoUrl = matches[0][1]
            .replace(/\\u002F/g, "/")
            .replace(/\\/g, "")
            .replace(/&amp;/g, "&");
          if (videoUrl.startsWith("http")) {
            console.log("[LISave] ✅ Found via progressive URL pattern");

            const allUrls = matches
              .map((m, i) => ({
                quality: i === 0 ? "Best" : `Option ${i + 1}`,
                url: m[1]
                  .replace(/\\u002F/g, "/")
                  .replace(/\\/g, "")
                  .replace(/&amp;/g, "&"),
                label: i === 0 ? "Best Quality" : `Option ${i + 1}`,
              }))
              .filter((f) => f.url.startsWith("http"));

            return NextResponse.json({
              formats: allUrls,
              defaultUrl: videoUrl,
              thumbnail: extractOgImage(html),
              title: extractOgTitle(html),
              author: extractAuthor(html),
              success: true,
            });
          }
        }
      }

      // A3: Brute force .mp4 scan in HTML
      const mp4Matches = [
        ...html.matchAll(/https:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/g),
      ];
      if (mp4Matches.length > 0) {
        const uniqueUrls = [
          ...new Set(mp4Matches.map((m) => m[0].replace(/&amp;/g, "&"))),
        ];
        const formats = uniqueUrls.slice(0, 4).map((u, i) => ({
          quality: i === 0 ? "Best" : `Option ${i + 1}`,
          url: u,
          label: i === 0 ? "Best Quality" : `Option ${i + 1}`,
        }));

        console.log("[LISave] ✅ Found via brute force mp4 scan");
        return NextResponse.json({
          formats,
          defaultUrl: formats[0].url,
          thumbnail: extractOgImage(html),
          title: extractOgTitle(html),
          author: extractAuthor(html),
          success: true,
        });
      }

      // A4: Look for og:video meta tag
      const ogVideo =
        html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/) ||
        html.match(/<meta\s+content="([^"]+)"\s+property="og:video"/);
      if (ogVideo) {
        const videoUrl = ogVideo[1].replace(/&amp;/g, "&");
        console.log("[LISave] ✅ Found via og:video");
        return NextResponse.json({
          formats: [{ quality: "Best", url: videoUrl, label: "Best Quality" }],
          defaultUrl: videoUrl,
          thumbnail: extractOgImage(html),
          title: extractOgTitle(html),
          author: extractAuthor(html),
          success: true,
        });
      }
    }

    // ── STRATEGY B: linkedinsave.app ──
    try {
      console.log("[LISave] Trying linkedinsave.app...");
      const lsRes = await fetch("https://linkedinsave.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const lsHtml = await lsRes.text();
      const tokenMatch =
        lsHtml.match(/name="_token"\s+value="([^"]+)"/) ||
        lsHtml.match(/name="csrf_token"\s+value="([^"]+)"/);
      const cookies = lsRes.headers.get("set-cookie") || "";

      if (tokenMatch) {
        const submitRes = await fetch("https://linkedinsave.app/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://linkedinsave.app/",
            Origin: "https://linkedinsave.app",
            Cookie: cookies,
          },
          body: new URLSearchParams({ url, _token: tokenMatch[1] }),
        });

        if (submitRes.ok) {
          const resultHtml = await submitRes.text();
          const mp4Match = resultHtml.match(
            /href="(https:\/\/[^"]+\.mp4[^"]*)"/,
          );
          if (mp4Match) {
            console.log("[LISave] ✅ linkedinsave.app success");
            return NextResponse.json({
              formats: [
                {
                  quality: "HD",
                  url: mp4Match[1].replace(/&amp;/g, "&"),
                  label: "HD Quality",
                },
              ],
              defaultUrl: mp4Match[1].replace(/&amp;/g, "&"),
              thumbnail: null,
              title: "LinkedIn Video",
              author: "",
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("[LISave] linkedinsave.app failed:", e.message);
    }

    // ── STRATEGY C: savelinkedin.com ──
    try {
      console.log("[LISave] Trying savelinkedin.com...");
      const slRes = await fetch("https://savelinkedin.com/download", {
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

      if (slRes.ok) {
        const slData = await slRes.json().catch(() => null);
        if (slData?.url || slData?.downloadUrl) {
          const videoUrl = slData.url || slData.downloadUrl;
          console.log("[LISave] ✅ savelinkedin.com success");
          return NextResponse.json({
            formats: [{ quality: "HD", url: videoUrl, label: "HD Quality" }],
            defaultUrl: videoUrl,
            thumbnail: slData.thumbnail || null,
            title: slData.title || "LinkedIn Video",
            author: slData.author || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[LISave] savelinkedin.com failed:", e.message);
    }

    // ── STRATEGY D: linkedin-downloader.com API ──
    try {
      console.log("[LISave] Trying linkedin-downloader.com...");
      const ldRes = await fetch(
        `https://linkedin-downloader.com/api/download?url=${encodeURIComponent(url)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://linkedin-downloader.com/",
            Accept: "application/json",
          },
        },
      );

      if (ldRes.ok) {
        const ldData = await ldRes.json();
        if (ldData.video_url || ldData.url) {
          const videoUrl = ldData.video_url || ldData.url;
          console.log("[LISave] ✅ linkedin-downloader success");
          return NextResponse.json({
            formats: [{ quality: "HD", url: videoUrl, label: "HD Quality" }],
            defaultUrl: videoUrl,
            thumbnail: ldData.thumbnail || null,
            title: ldData.title || "LinkedIn Video",
            author: ldData.author || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[LISave] linkedin-downloader failed:", e.message);
    }

    // ── STRATEGY E: RapidAPI (if key available) ──
    if (process.env.RAPIDAPI_KEY) {
      try {
        console.log("[LISave] Trying RapidAPI...");
        const rapidRes = await fetch(
          `https://linkedin-video-downloader2.p.rapidapi.com/download?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "linkedin-video-downloader2.p.rapidapi.com",
            },
          },
        );

        if (rapidRes.ok) {
          const rapidData = await rapidRes.json();
          console.log(
            "[LISave] RapidAPI response:",
            JSON.stringify(rapidData).substring(0, 300),
          );

          const videoUrl =
            rapidData.url || rapidData.downloadUrl || rapidData.video;
          if (videoUrl) {
            const formats = [];
            if (rapidData.hd)
              formats.push({
                quality: "720p",
                url: rapidData.hd,
                label: "HD 720p",
              });
            if (rapidData.sd)
              formats.push({
                quality: "360p",
                url: rapidData.sd,
                label: "SD 360p",
              });
            if (!formats.length)
              formats.push({
                quality: "HD",
                url: videoUrl,
                label: "HD Quality",
              });

            console.log("[LISave] ✅ RapidAPI success");
            return NextResponse.json({
              formats,
              defaultUrl: formats[0].url,
              thumbnail: rapidData.thumbnail || null,
              title: rapidData.title || "LinkedIn Video",
              author: rapidData.author || "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[LISave] RapidAPI failed:", e.message);
      }
    }

    console.log("[LISave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract video. LinkedIn requires posts to be public. If the video is behind a login wall, it cannot be downloaded.",
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
    ? m[1].replace(/&amp;/g, "&").replace(" | LinkedIn", "").trim()
    : "LinkedIn Video";
}

function extractAuthor(html) {
  const m =
    html.match(
      /"author"\s*:\s*\{\s*"@type"\s*:\s*"Person"\s*,\s*"name"\s*:\s*"([^"]+)"/,
    ) || html.match(/class="[^"]*actor[^"]*"[^>]*>([^<]+)</);
  return m ? m[1].trim() : "";
}
