// app/api/instagram-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `IGSave-${Date.now()}`;
  const type = searchParams.get("type") || "video";

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const isAllowed =
    parsedUrl.hostname.includes("cdninstagram") ||
    parsedUrl.hostname.includes("instagram") ||
    parsedUrl.hostname.includes("fbcdn") ||
    parsedUrl.hostname.includes("snapinsta") ||
    parsedUrl.hostname.includes("igram");

  if (!isAllowed) {
    console.warn("[IGProxy] Blocked host:", parsedUrl.hostname);
    return new Response("URL not allowed: " + parsedUrl.hostname, {
      status: 403,
    });
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
        Referer: "https://www.instagram.com/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });

    if (!res.ok)
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });

    const data = await res.arrayBuffer();
    if (data.byteLength < 500)
      return new Response("File too small", { status: 502 });

    const isImage = type === "image" || fileUrl.match(/\.(jpg|jpeg|png|webp)/i);
    const ext = isImage ? "jpg" : "mp4";
    const contentType = isImage ? "image/jpeg" : "video/mp4";

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
