export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `TwitchSave-${Date.now()}`;

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const isAllowed =
    parsedUrl.hostname.includes("twitch") ||
    parsedUrl.hostname.includes("cloudfront") ||
    parsedUrl.hostname.includes("twitchsvc");

  if (!isAllowed) return new Response("URL not allowed", { status: 403 });

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.twitch.tv/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
        Origin: "https://www.twitch.tv",
      },
    });

    if (!res.ok)
      return new Response(`Upstream error: ${res.status}`, {
        status: res.status,
      });

    const contentType = res.headers.get("Content-Type") || "";

    // M3U8 playlists — return as-is
    if (contentType.includes("mpegurl") || fileUrl.includes(".m3u8")) {
      const text = await res.text();
      return new Response(text, {
        status: 200,
        headers: {
          "Content-Type": "application/x-mpegURL",
          "Cache-Control": "no-store",
        },
      });
    }

    const data = await res.arrayBuffer();
    if (data.byteLength < 1000)
      return new Response("File too small", { status: 502 });

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}.mp4"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
