// app/api/tiktok-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("No URL provided", { status: 400 });
  }

  // Security: only allow known TikTok CDN domains
  const allowedHosts = [
    "tiktok.com",
    "tiktokcdn.com",
    "tiktokv.com",
    "tikwm.com",
    "muscdn.com",
    "akamaized.net",
    "byteaccdn.com",
    "snaptik.app",
  ];

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const isAllowed = allowedHosts.some((host) =>
    parsedUrl.hostname.endsWith(host),
  );
  if (!isAllowed) {
    // Allow tikwm CDN subdomains
    const isTikwmCdn =
      parsedUrl.hostname.includes("tikwm") ||
      parsedUrl.hostname.includes("tiktok");
    if (!isTikwmCdn) {
      console.warn("[TikSave Proxy] Blocked host:", parsedUrl.hostname);
      return new Response("URL not allowed: " + parsedUrl.hostname, {
        status: 403,
      });
    }
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.tiktok.com/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
        Range: "bytes=0-",
      },
    });

    if (!res.ok) {
      return new Response(`Upstream error: ${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }

    const data = await res.arrayBuffer();

    if (data.byteLength < 1000) {
      return new Response("Response too small — likely an error", {
        status: 502,
      });
    }

    const upstreamContentType = res.headers.get("Content-Type") || "";
    const isVideo =
      fileUrl.includes(".mp4") || upstreamContentType.includes("video");

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": isVideo ? "video/mp4" : "application/octet-stream",
        "Content-Disposition": `attachment; filename="TikSave-${Date.now()}.mp4"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[TikSave Proxy] Error:", err);
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
