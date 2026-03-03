// app/api/facebook-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `FBSave-${Date.now()}`;
  const type = searchParams.get("type") || "video"; // 'video' or 'image'

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const allowedPatterns = [
    "facebook.com",
    "fbcdn.net",
    "fdownloader.net",
    "getfvid.com",
    "sf-tools.com",
  ];

  const isAllowed = allowedPatterns.some((p) => parsedUrl.hostname.endsWith(p));
  if (!isAllowed) {
    const isFbCdn =
      parsedUrl.hostname.includes("facebook") ||
      parsedUrl.hostname.includes("fbcdn");
    if (!isFbCdn) {
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
        Referer: "https://www.facebook.com/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });

    if (!res.ok)
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });

    const data = await res.arrayBuffer();
    if (data.byteLength < 1000)
      return new Response("File too small", { status: 502 });

    const isImage = type === "image" || fileUrl.match(/\.(jpg|jpeg|png|webp)/i);
    const contentType = isImage ? "image/jpeg" : "video/mp4";
    const ext = isImage ? "jpg" : "mp4";

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
