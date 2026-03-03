// app/api/youtube-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // Allow YouTube CDN and known converter CDNs
  const allowedPatterns = [
    "googlevideo.com",
    "youtube.com",
    "ytimg.com",
    "y2mate.com",
    "savefrom.net",
    "sf-tools.com",
    "cobalt.tools",
    "ytsave.net",
  ];

  const isAllowed = allowedPatterns.some((p) => parsedUrl.hostname.endsWith(p));
  if (!isAllowed) {
    console.warn("[YTSave Proxy] Blocked host:", parsedUrl.hostname);
    return new Response("URL not allowed: " + parsedUrl.hostname, {
      status: 403,
    });
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.youtube.com/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });

    if (!res.ok) {
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });
    }

    const data = await res.arrayBuffer();

    if (data.byteLength < 1000) {
      return new Response("File too small", { status: 502 });
    }

    const contentType = res.headers.get("Content-Type") || "video/mp4";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType.includes("video")
          ? contentType
          : "video/mp4",
        "Content-Disposition": `attachment; filename="YTSave-${Date.now()}.mp4"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
