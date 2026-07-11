// app/api/instagram-info/route.js
import { NextResponse } from "next/server";

const RENDER_URL = process.env.YTDLP_API_URL || "";
const RENDER_SECRET = process.env.YTDLP_API_SECRET || "";

function detectUrlType(url = "") {
  if (/instagram\.com\/(reel|reels)\//i.test(url)) return "reel";
  if (/instagram\.com\/p\//i.test(url)) return "post";
  if (/instagram\.com\/tv\//i.test(url)) return "igtv";
  return "unknown";
}

// Strip tracking params — yt-dlp only needs the path
function cleanIgUrl(url = "") {
  try {
    const u = new URL(url);
    return `https://www.instagram.com${u.pathname.replace(/\/$/, "")}/`;
  } catch {
    return url;
  }
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
    const urlType = detectUrlType(url);
    console.log(`[Instagram Info] type=${urlType}  url=${url}`);

    let renderRes;
    try {
      renderRes = await fetch(`${RENDER_URL}/instagram/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": RENDER_SECRET,
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (fetchErr) {
      console.error(
        "[Instagram Info] Network error reaching Flask:",
        fetchErr.message,
      );
      return NextResponse.json(
        { error: "Could not reach media service: " + fetchErr.message },
        { status: 502 },
      );
    }

    // Read body ONCE — calling .json() twice on the same Response throws
    let data;
    try {
      data = await renderRes.json();
    } catch (parseErr) {
      console.error(
        "[Instagram Info] Flask response was not JSON:",
        parseErr.message,
      );
      return NextResponse.json(
        { error: "Media service returned an unexpected response." },
        { status: 502 },
      );
    }

    if (!renderRes.ok || data?.error) {
      console.error(
        `[Instagram Info] Flask error (${renderRes.status}):`,
        data?.error,
      );
      return NextResponse.json(
        { error: data?.error || `Media service error (${renderRes.status})` },
        { status: renderRes.status || 500 },
      );
    }

    console.log(`[Instagram Info] ✅ type=${data.type}  urlType=${urlType}`);
    return NextResponse.json({ ...data, urlType });
  } catch (error) {
    console.error("[Instagram Info] Unhandled error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
