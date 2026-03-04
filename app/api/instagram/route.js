// app/api/instagram/route.js
import { NextResponse } from "next/server";

function extractInstagramInfo(url) {
  const reelMatch = url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/);
  if (reelMatch) return { type: "reel", id: reelMatch[1] };
  const postMatch = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
  if (postMatch) return { type: "post", id: postMatch[1] };
  const tvMatch = url.match(/instagram\.com\/tv\/([a-zA-Z0-9_-]+)/);
  if (tvMatch) return { type: "tv", id: tvMatch[1] };
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

function classifyUrl(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  if (
    u.includes(".mp4") ||
    u.includes("video") ||
    u.includes("/v/") ||
    u.includes("efg=") ||
    u.includes("vp=") ||
    u.includes("_video")
  )
    return "video";
  if (
    u.includes(".jpg") ||
    u.includes(".jpeg") ||
    u.includes(".png") ||
    u.includes(".webp") ||
    u.includes("/e35/") ||
    u.includes("/e15/") ||
    u.includes("_n.jpg")
  )
    return "image";
  return null;
}

// Recursively scan any API response object for video/image URLs
function deepScanForMedia(obj, depth = 0, seen = new Set()) {
  if (depth > 8 || !obj) return [];
  const items = [];

  const addUrl = (url, type, thumb = null) => {
    const clean = decodeUrl(url);
    if (!clean || !clean.startsWith("http") || seen.has(clean)) return;
    seen.add(clean);
    items.push({ type, url: clean, thumbnail: thumb || null });
  };

  if (typeof obj === "object" && !Array.isArray(obj)) {
    // Priority: explicit video fields
    const VIDEO_FIELDS = ["video_url", "playback_url", "dash_url"];
    const VIDEO_ARRAY_FIELDS = ["video_versions", "videos"];
    const IMG_FIELDS = ["display_url", "thumbnail_url"];

    const thumbUrl =
      obj.display_url ||
      obj.thumbnail_url ||
      obj.thumbnail ||
      obj.image_versions2?.candidates?.[0]?.url ||
      null;

    for (const f of VIDEO_FIELDS) {
      if (obj[f] && typeof obj[f] === "string")
        addUrl(obj[f], "video", thumbUrl);
    }
    for (const f of VIDEO_ARRAY_FIELDS) {
      if (Array.isArray(obj[f]) && obj[f][0]?.url)
        addUrl(obj[f][0].url, "video", thumbUrl);
    }

    // If no video was found from this object, check for image
    const hasVideo = items.some((i) => i.type === "video");
    if (!hasVideo) {
      for (const f of IMG_FIELDS) {
        if (obj[f] && typeof obj[f] === "string")
          addUrl(obj[f], "image", obj[f]);
      }
      if (obj.image_versions2?.candidates?.[0]?.url) {
        addUrl(
          obj.image_versions2.candidates[0].url,
          "image",
          obj.image_versions2.candidates[0].url,
        );
      }
    }

    // Recurse carousel/sidecar children
    const CAROUSEL_FIELDS = ["carousel_media", "items", "medias"];
    for (const f of CAROUSEL_FIELDS) {
      if (Array.isArray(obj[f])) {
        for (const child of obj[f])
          items.push(...deepScanForMedia(child, depth + 1, seen));
      }
    }
    if (obj.edge_sidecar_to_children?.edges) {
      for (const e of obj.edge_sidecar_to_children.edges) {
        items.push(...deepScanForMedia(e.node, depth + 1, seen));
      }
    }

    // Recurse other object keys (but not ones we already processed)
    const SKIP = new Set([
      ...VIDEO_FIELDS,
      ...VIDEO_ARRAY_FIELDS,
      ...IMG_FIELDS,
      ...CAROUSEL_FIELDS,
      "edge_sidecar_to_children",
      "image_versions2",
      "owner",
      "user",
      "caption",
      "location",
      "music_metadata",
    ]);
    for (const key of Object.keys(obj)) {
      if (!SKIP.has(key) && typeof obj[key] === "object" && obj[key] !== null) {
        items.push(...deepScanForMedia(obj[key], depth + 1, seen));
      }
    }
  } else if (Array.isArray(obj)) {
    for (const child of obj)
      items.push(...deepScanForMedia(child, depth + 1, seen));
  }

  // Dedupe by url
  const deduped = [];
  const dedupeSet = new Set();
  for (const item of items) {
    if (!dedupeSet.has(item.url)) {
      dedupeSet.add(item.url);
      deduped.push(item);
    }
  }
  return deduped;
}

// Parse HTML from third-party downloader responses
function parseMediaFromHtml(html) {
  const items = [];
  const seenUrls = new Set();
  const add = (type, rawUrl, thumbnail = null) => {
    const clean = decodeUrl(rawUrl);
    if (!clean.startsWith("http") || seenUrls.has(clean)) return;
    seenUrls.add(clean);
    items.push({ type, url: clean, thumbnail });
  };

  for (const m of html.matchAll(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/g))
    add("video", m[1]);
  for (const m of html.matchAll(
    /data-(?:url|href|src)="(https?:\/\/[^"]+\.mp4[^"]*)"/g,
  ))
    add("video", m[1]);
  for (const m of html.matchAll(
    /"(?:url|src|video_url|download_url)"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/g,
  ))
    add("video", decodeUrl(m[1]));
  for (const m of html.matchAll(
    /href="(https?:\/\/[^"]*(?:fbcdn\.net|cdninstagram\.com)[^"]*(?:\.mp4|efg=|video)[^"]*)"/g,
  ))
    add("video", m[1]);
  for (const m of html.matchAll(
    /href="(https?:\/\/[^"]*(?:cdninstagram|fbcdn|scontent)[^"]+)"/g,
  )) {
    const t = classifyUrl(m[1]);
    if (t) add(t, m[1]);
  }
  for (const m of html.matchAll(
    /href="(https?:\/\/[^"]*(?:cdninstagram|scontent)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/g,
  ))
    add("image", m[1], m[1].replace(/&amp;/g, "&"));

  const thumbs = [
    ...html.matchAll(
      /src="(https?:\/\/[^"]*(?:cdninstagram|scontent)[^"]*\.(?:jpg|jpeg|webp)[^"]*)"/g,
    ),
  ].map((m) => m[1].replace(/&amp;/g, "&"));
  items.forEach((item, i) => {
    if (!item.thumbnail && thumbs[i]) item.thumbnail = thumbs[i];
  });
  return items;
}

function ok(info, items, extra = {}) {
  return NextResponse.json({
    type: info.type,
    shortcode: info.id,
    mediaItems: items.map((item, i) => ({ ...item, index: i })),
    success: true,
    ...extra,
  });
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string")
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    url = url.trim().split("?")[0].replace(/\/$/, "");
    console.log("[IGSave] URL:", url);

    const info = extractInstagramInfo(url);
    if (!info)
      return NextResponse.json(
        { error: "Invalid Instagram URL." },
        { status: 400 },
      );

    // ── STRATEGY A: RapidAPI ──
    if (process.env.RAPIDAPI_KEY) {
      // A1: instagram-scraper-api2
      try {
        const r = await fetch(
          `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "instagram-scraper-api2.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const data = await r.json();
          const post = data.data || data;
          console.log("[IGSave] A1 keys:", Object.keys(post || {}).join(","));
          console.log(
            "[IGSave] A1 video_url:",
            !!post?.video_url,
            "video_versions:",
            post?.video_versions?.length,
          );
          const items = deepScanForMedia(post);
          console.log(
            "[IGSave] A1 items:",
            items.map((i) => `${i.type}:${i.url.slice(0, 80)}`),
          );
          if (items.length > 0)
            return ok(info, items, {
              title: post.caption?.text?.slice(0, 120) || "",
              author: post.owner?.username || post.user?.username || "",
            });
        }
      } catch (e) {
        console.error("[IGSave] A1:", e.message);
      }

      // A2: bulk-scrapper
      try {
        const r = await fetch(
          `https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_code?shortcode=${info.id}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host":
                "instagram-bulk-profile-scrapper.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const data = await r.json();
          const items = deepScanForMedia(data.data || data);
          console.log(
            "[IGSave] A2 items:",
            items.map((i) => `${i.type}:${i.url.slice(0, 80)}`),
          );
          if (items.length > 0) return ok(info, items);
        }
      } catch (e) {
        console.error("[IGSave] A2:", e.message);
      }

      // A3: downloader4
      try {
        const r = await fetch(
          `https://instagram-downloader4.p.rapidapi.com/api/download?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host": "instagram-downloader4.p.rapidapi.com",
            },
          },
        );
        if (r.ok) {
          const data = await r.json();
          console.log("[IGSave] A3:", JSON.stringify(data).slice(0, 400));
          const items = deepScanForMedia(data);
          if (items.length > 0)
            return ok(info, items, {
              title: data.caption || "",
              author: data.username || "",
            });
        }
      } catch (e) {
        console.error("[IGSave] A3:", e.message);
      }

      // A4: social-media-video-downloader
      try {
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
          console.log("[IGSave] A4:", JSON.stringify(data).slice(0, 400));
          if (data.success && data.links?.length > 0) {
            const items = data.links.map((l, i) => ({
              type: classifyUrl(l.link) || "video",
              url: l.link,
              thumbnail: data.picture || null,
              index: i,
            }));
            if (items.length > 0)
              return ok(info, items, { title: data.title || "" });
          }
        }
      } catch (e) {
        console.error("[IGSave] A4:", e.message);
      }
    }

    // ── STRATEGY B: snapinsta.app ──
    try {
      const init = await fetch("https://snapinsta.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const initHtml = await init.text();
      const tok =
        initHtml.match(/name="token"\s+value="([^"]+)"/) ||
        initHtml.match(/"token"\s*:\s*"([^"]+)"/);
      const cookies = init.headers.get("set-cookie") || "";
      if (tok) {
        const sub = await fetch("https://snapinsta.app/action.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://snapinsta.app/",
            Origin: "https://snapinsta.app",
            Cookie: cookies,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({ url, token: tok[1] }),
        });
        if (sub.ok) {
          const html = await sub.text();
          console.log(
            "[IGSave] B len:",
            html.length,
            "mp4:",
            html.includes(".mp4"),
            "fbcdn:",
            html.includes("fbcdn"),
          );
          const items = parseMediaFromHtml(html);
          console.log(
            "[IGSave] B items:",
            items.map((i) => `${i.type}:${i.url.slice(0, 80)}`),
          );
          if (items.length > 0) return ok(info, items);
        }
      }
    } catch (e) {
      console.error("[IGSave] B:", e.message);
    }

    // ── STRATEGY C: saveinsta.app ──
    try {
      const init = await fetch("https://saveinsta.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const initHtml = await init.text();
      const tok =
        initHtml.match(/name="token"\s+value="([^"]+)"/) ||
        initHtml.match(/"token"\s*:\s*"([^"]+)"/);
      const cookies = init.headers.get("set-cookie") || "";
      if (tok) {
        const sub = await fetch("https://saveinsta.app/action.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://saveinsta.app/",
            Origin: "https://saveinsta.app",
            Cookie: cookies,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({ url, token: tok[1] }),
        });
        if (sub.ok) {
          const html = await sub.text();
          const items = parseMediaFromHtml(html);
          if (items.length > 0) return ok(info, items);
        }
      }
    } catch (e) {
      console.error("[IGSave] C:", e.message);
    }

    // ── STRATEGY D: sssinstagram.com ──
    try {
      const init = await fetch("https://sssinstagram.com/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const initHtml = await init.text();
      const tok =
        initHtml.match(/name="_token"\s+value="([^"]+)"/) ||
        initHtml.match(/csrf.token['":\s]+["']([a-zA-Z0-9]+)/);
      const cookies = init.headers.get("set-cookie") || "";
      if (tok) {
        const sub = await fetch("https://sssinstagram.com/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://sssinstagram.com/",
            Origin: "https://sssinstagram.com",
            Cookie: cookies,
          },
          body: new URLSearchParams({ url, _token: tok[1] }),
        });
        if (sub.ok) {
          const rawText = await sub.text();
          try {
            const data = JSON.parse(rawText);
            const list = data?.data?.items || data?.items || data?.medias || [];
            if (list.length > 0) {
              const items = list
                .map((m, i) => {
                  const u = m.url || m.download || m.src;
                  return {
                    type:
                      classifyUrl(u || "") ||
                      (m.type === "image" ? "image" : "video"),
                    url: u,
                    thumbnail: m.thumbnail || m.thumb || null,
                    index: i,
                  };
                })
                .filter((m) => m.url);
              if (items.length > 0) return ok(info, items);
            }
          } catch {}
          const items = parseMediaFromHtml(rawText);
          if (items.length > 0) return ok(info, items);
        }
      }
    } catch (e) {
      console.error("[IGSave] D:", e.message);
    }

    // ── STRATEGY E: cobalt.tools — supports Instagram reels natively ──
    try {
      console.log("[IGSave] E: cobalt.tools...");
      const r = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          url,
          videoQuality: "1080",
          filenameStyle: "classic",
        }),
      });
      if (r.ok) {
        const data = await r.json();
        console.log("[IGSave] E cobalt:", JSON.stringify(data).slice(0, 300));
        if (
          (data.status === "stream" ||
            data.status === "redirect" ||
            data.status === "tunnel") &&
          data.url
        ) {
          return ok(info, [{ type: "video", url: data.url, thumbnail: null }]);
        }
        if (data.status === "picker" && data.picker?.length > 0) {
          const items = data.picker.map((p, i) => ({
            type: classifyUrl(p.url) || "video",
            url: p.url,
            thumbnail: p.thumb || null,
            index: i,
          }));
          return ok(info, items);
        }
      }
    } catch (e) {
      console.error("[IGSave] E:", e.message);
    }

    // ── STRATEGY F: Direct Instagram page scrape ──
    try {
      console.log("[IGSave] F: direct scrape...");
      const pageRes = await fetch(url + "/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
          Accept: "text/html,application/xhtml+xml,*/*",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const html = await pageRes.text();
      const items = [];
      const seen = new Set();
      for (const m of html.matchAll(/"video_url"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
        const u = decodeUrl(m[1]);
        if (u.startsWith("http") && !seen.has(u)) {
          seen.add(u);
          items.push({ type: "video", url: u, thumbnail: null });
        }
      }
      const ogVid = html
        .match(/property="og:video(?::url)?"\s+content="([^"]+)"/)?.[1]
        ?.replace(/&amp;/g, "&");
      if (ogVid && !seen.has(ogVid)) {
        seen.add(ogVid);
        items.push({ type: "video", url: ogVid, thumbnail: null });
      }
      const thumbUrl = html
        .match(/property="og:image"\s+content="([^"]+)"/)?.[1]
        ?.replace(/&amp;/g, "&");
      items.forEach((i) => {
        if (!i.thumbnail) i.thumbnail = thumbUrl || null;
      });
      if (items.length === 0 && thumbUrl)
        items.push({ type: "image", url: thumbUrl, thumbnail: thumbUrl });
      if (items.length > 0) {
        console.log("[IGSave] ✅ F success");
        return ok(info, items);
      }
    } catch (e) {
      console.error("[IGSave] F:", e.message);
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Could not extract media. Make sure the post is public. Add RAPIDAPI_KEY to .env.local for best results.",
      },
      { status: 404 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
