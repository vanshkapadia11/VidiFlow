// app/api/thumbnail-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `thumbnail-${Date.now()}`;

  if (!imageUrl) return new Response("No URL provided", { status: 400 });

  // Only allow YouTube thumbnail CDN
  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (!parsedUrl.hostname.endsWith("ytimg.com")) {
    return new Response("URL not allowed", { status: 403 });
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.youtube.com/",
        Accept: "image/*",
      },
    });

    if (!res.ok)
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });

    const data = await res.arrayBuffer();
    if (data.byteLength < 500)
      return new Response("Image not found", { status: 404 });

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${filename}.jpg"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
