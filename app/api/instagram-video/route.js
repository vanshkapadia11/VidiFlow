// app/api/instagram-video/route.js
//
// Routing logic:
//   /p/...    → POST /instagram/post  (auto-detects: video, image, or carousel ZIP)
//   /reel/... → POST /instagram/post
//   /tv/...   → POST /instagram/post
//   fallback  → POST /instagram/video (legacy)
//
import { NextResponse } from "next/server";

const RENDER_URL = process.env.YTDLP_API_URL || "";
const RENDER_SECRET = process.env.YTDLP_API_SECRET || "";

// Strip UTM/tracking params so yt-dlp gets a clean URL
function cleanIgUrl(url = "") {
  try {
    const u = new URL(url);
    return `https://www.instagram.com${u.pathname.replace(/\/$/, "")}/`;
  } catch {
    return url;
  }
}

function pickFlaskEndpoint(url = "") {
  if (/instagram\.com\/(p|reel|reels|tv)\//i.test(url)) {
    return "/instagram/post";
  }
  return "/instagram/video"; // legacy fallback
}

function pickResponseMeta(responseHeaders) {
  const disposition = responseHeaders.get("Content-Disposition") || "";
  const ct = responseHeaders.get("Content-Type") || "";

  if (ct.includes("application/zip") || disposition.includes(".zip")) {
    return { mime: "application/zip", disposition };
  }
  if (ct.startsWith("image/")) {
    return { mime: ct.split(";")[0], disposition };
  }
  return {
    mime: "video/mp4",
    disposition: disposition || 'attachment; filename="instagram.mp4"',
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const rawUrl = body?.url?.trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    if (!RENDER_URL) {
      return NextResponse.json(
        { error: "Media service not configured." },
        { status: 500 },
      );
    }

    const url = cleanIgUrl(rawUrl);
    const endpoint = pickFlaskEndpoint(url);
    console.log(`[Instagram DL] ${url} → ${endpoint}`);

    let renderRes;
    try {
      renderRes = await fetch(`${RENDER_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": RENDER_SECRET,
        },
        body: JSON.stringify({ url }),
        // Carousels can take a while — generous timeout
        signal: AbortSignal.timeout(300_000),
      });
    } catch (fetchErr) {
      console.error("[Instagram DL] Network error:", fetchErr.message);
      return NextResponse.json(
        { error: "Could not reach media service: " + fetchErr.message },
        { status: 502 },
      );
    }

    const ct = renderRes.headers.get("Content-Type") || "";

    // Flask returned a JSON error body
    if (!renderRes.ok || ct.includes("application/json")) {
      let errData = {};
      try {
        errData = await renderRes.json();
      } catch {}
      return NextResponse.json(
        { error: errData.error || `Media service error (${renderRes.status})` },
        { status: renderRes.status || 500 },
      );
    }

    // Stream binary (video / image / zip) straight to the browser
    const { mime, disposition } = pickResponseMeta(renderRes.headers);
    const contentLength = renderRes.headers.get("Content-Length");

    const headers = new Headers({
      "Content-Type": mime,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    });
    if (contentLength) headers.set("Content-Length", contentLength);

    console.log(
      `[Instagram DL] ✅ streaming ${mime} (${contentLength ?? "??"} bytes)`,
    );
    return new Response(renderRes.body, { status: 200, headers });
  } catch (error) {
    console.error("[Instagram DL] Unhandled error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
