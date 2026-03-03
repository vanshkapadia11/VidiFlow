export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `YTAudio-${Date.now()}`;

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const allowedPatterns = [
    "googlevideo.com",
    "youtube.com",
    "y2mate.com",
    "yt5s.io",
    "cobalt.tools",
    "loader.to",
    "cdn.loader.to",
  ];

  const isAllowed = allowedPatterns.some((p) => parsedUrl.hostname.endsWith(p));
  if (!isAllowed) return new Response("URL not allowed", { status: 403 });

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.youtube.com/",
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

    const contentType = res.headers.get("Content-Type") || "audio/mpeg";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType.includes("audio")
          ? contentType
          : "audio/mpeg",
        "Content-Disposition": `attachment; filename="${filename}.mp3"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
