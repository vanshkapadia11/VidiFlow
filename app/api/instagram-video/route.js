// app/api/instagram-video/route.js
import { NextResponse } from "next/server";

const RENDER_URL = process.env.YTDLP_API_URL || "";
const RENDER_SECRET = process.env.YTDLP_API_SECRET || "";

export async function POST(req) {
  try {
    const body = await req.json();
    const url = body?.url?.trim();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    if (!RENDER_URL)
      return NextResponse.json(
        { error: "Media service not configured." },
        { status: 500 },
      );

    const renderRes = await fetch(`${RENDER_URL}/instagram/video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": RENDER_SECRET,
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(300_000),
    });

    const contentType = renderRes.headers.get("Content-Type") || "";
    if (!renderRes.ok || contentType.includes("application/json")) {
      const errData = await renderRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || `Error ${renderRes.status}` },
        { status: renderRes.status || 500 },
      );
    }

    const disposition =
      renderRes.headers.get("Content-Disposition") ||
      'attachment; filename="instagram-video.mp4"';
    const contentLength = renderRes.headers.get("Content-Length");

    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Content-Disposition": disposition,
    });
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(renderRes.body, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
