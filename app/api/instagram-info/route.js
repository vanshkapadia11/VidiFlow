// app/api/instagram-info/route.js
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

    const renderRes = await fetch(`${RENDER_URL}/instagram/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": RENDER_SECRET,
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await renderRes.json();
    if (!renderRes.ok || data.error) {
      return NextResponse.json(
        { error: data.error || `Error ${renderRes.status}` },
        { status: renderRes.status || 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
