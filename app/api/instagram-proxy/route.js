// app/api/instagram-proxy/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `InstaRip-${Date.now()}`;
  const type = searchParams.get("type") || "video";

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // ✅ Instagram videos are served from fbcdn.net (Facebook CDN) — this is critical
  const allowedHosts = [
    "cdninstagram.com", // older IG CDN
    "fbcdn.net", // ✅ PRIMARY: Facebook CDN serves ALL Instagram videos
    "instagram.com",
    "scontent.cdninstagram.com",
    "snapinsta.app",
    "saveinsta.app",
    "igdownloader.app",
    "sssinstagram.com",
  ];

  const isAllowed = allowedHosts.some(
    (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith("." + h),
  );

  if (!isAllowed) {
    // Don't hard-block — log and try anyway (some third-party CDNs use dynamic hostnames)
    console.warn(
      "[IG-Proxy] Non-allowlisted host:",
      parsedUrl.hostname,
      "— trying anyway",
    );
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
        Referer: "https://www.instagram.com/",
        Accept:
          type === "image"
            ? "image/webp,image/jpeg,image/*,*/*"
            : "video/mp4,video/webm,video/*,*/*",
        "Accept-Encoding": "identity", // no compression — we need raw bytes
        Origin: "https://www.instagram.com",
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) {
      console.error(
        "[IG-Proxy] Upstream error:",
        res.status,
        fileUrl.substring(0, 80),
      );
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });
    }

    const data = await res.arrayBuffer();
    if (data.byteLength < 500)
      return new Response("File too small", { status: 502 });

    // Determine extension and content-type
    const upstreamCT = res.headers.get("content-type") || "";
    const isImage = type === "image" || upstreamCT.startsWith("image/");
    const contentType = isImage
      ? upstreamCT.startsWith("image/")
        ? upstreamCT.split(";")[0]
        : "image/jpeg"
      : "video/mp4";
    const ext = isImage
      ? upstreamCT.includes("png")
        ? "png"
        : upstreamCT.includes("webp")
          ? "webp"
          : "jpg"
      : "mp4";

    console.log(
      `[IG-Proxy] ✅ Serving ${data.byteLength} bytes as ${contentType}`,
    );

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}.${ext}"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[IG-Proxy] Error:", err.message);
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
