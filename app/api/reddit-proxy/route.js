// app/api/reddit-proxy/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "video/mp4,video/*,*/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        Referer: "https://www.reddit.com/",
        Origin: "https://www.reddit.com",
        "Sec-Fetch-Dest": "video",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        Connection: "keep-alive",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`[RedditProxy] Failed: ${response.status} for ${url}`);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status}` },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");

    const responseHeaders = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    };

    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[RedditProxy] Error:", error.message);
    return NextResponse.json(
      { error: "Proxy error: " + error.message },
      { status: 500 },
    );
  }
}
