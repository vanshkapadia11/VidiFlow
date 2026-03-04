// app/api/linkedin-proxy/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `LISave-${Date.now()}`;
  const type = searchParams.get("type") || "video"; // "video" | "image"

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // Allow known LinkedIn & CDN hostnames
  const allowedHosts = [
    "media.licdn.com",
    "dms.licdn.com",
    "media-exp1.licdn.com",
    "media-exp2.licdn.com",
    "media-exp3.licdn.com",
    "static.licdn.com",
    "linkedin.com",
    "licdn.com",
    // Third-party downloader CDNs
    "linkedinsave.app",
    "savelinkedin.com",
    "linkedin-downloader.com",
  ];

  const isAllowed = allowedHosts.some(
    (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith("." + h),
  );

  if (!isAllowed) {
    // Try anyway — some third-party CDNs have dynamic hostnames
    console.warn(
      "[LI-Proxy] Non-allowlisted host:",
      parsedUrl.hostname,
      "— attempting anyway",
    );
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.linkedin.com/",
        Accept:
          type === "image"
            ? "image/webp,image/jpeg,*/*"
            : "video/mp4,video/*,*/*",
        "Accept-Encoding": "identity",
        Origin: "https://www.linkedin.com",
      },
    });

    if (!res.ok)
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });

    const data = await res.arrayBuffer();
    if (data.byteLength < 500)
      return new Response("File too small", { status: 502 });

    // Determine content type from response header or type param
    const upstreamCT = res.headers.get("content-type") || "";
    const isImage = type === "image" || upstreamCT.startsWith("image/");
    const contentType = isImage
      ? upstreamCT.startsWith("image/")
        ? upstreamCT
        : "image/jpeg"
      : "video/mp4";
    const ext = isImage
      ? upstreamCT.includes("png")
        ? "png"
        : upstreamCT.includes("webp")
          ? "webp"
          : "jpg"
      : "mp4";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}.${ext}"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
