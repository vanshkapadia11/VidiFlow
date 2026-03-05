// app/api/youtube-audio-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `AudioRip-${Date.now()}`;

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // googlevideo.com is signed to client IP — can't proxy, send redirect signal
  if (parsedUrl.hostname.endsWith("googlevideo.com")) {
    return new Response(JSON.stringify({ redirect: fileUrl }), {
      status: 302,
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Action": "direct-download",
        "X-Direct-URL": fileUrl,
      },
    });
  }

  const allowedPatterns = [
    "yt5s.io",
    "yt1s.com",
    "cdn.yt5s.io",
    "y2down.cc",
    "cdn.y2down.cc",
    "y2mate.com",
    "y2mate.nu",
    "cobalt.tools",
    "mp3-youtube.download",
    "savefrom.net",
    "sf-cdn.net",
    "loader.to",
    "ytcdn.net",
    "ytsave.net",
    // invidious instances
    "invidious.privacyredirect.com",
    "inv.nadeko.net",
    "invidious.nerdvpn.de",
    "yt.artemislena.eu",
    // generic CDNs converters use
    "akamaized.net",
    "cloudfront.net",
    "fastly.net",
    "rapidapi.com",
  ];

  const isAllowed = allowedPatterns.some(
    (p) =>
      parsedUrl.hostname === p ||
      parsedUrl.hostname.endsWith("." + p) ||
      parsedUrl.hostname.includes(p),
  );

  if (!isAllowed) {
    console.warn("[YTAudio Proxy] Blocked host:", parsedUrl.hostname);
    return new Response("URL not allowed: " + parsedUrl.hostname, {
      status: 403,
    });
  }

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  ];

  for (const ua of userAgents) {
    try {
      const res = await fetch(fileUrl, {
        headers: {
          "User-Agent": ua,
          Referer: "https://www.youtube.com/",
          Accept: "audio/mp3,audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "identity",
          Range: "bytes=0-",
        },
      });

      console.log(`[YTAudio Proxy] ${parsedUrl.hostname} → ${res.status}`);
      if (!res.ok && res.status !== 206) continue;

      const data = await res.arrayBuffer();
      if (data.byteLength < 1000) continue;

      const ct = res.headers.get("content-type") || "";
      // Detect format: webm audio from invidious vs mp3 from converters
      const isWebm = ct.includes("webm") || fileUrl.includes(".webm");
      const isMp4Audio = ct.includes("mp4") && ct.includes("audio");
      const ext = isWebm ? "webm" : isMp4Audio ? "m4a" : "mp3";
      const contentType = isWebm
        ? "audio/webm"
        : isMp4Audio
          ? "audio/mp4"
          : "audio/mpeg";

      const safeFilename =
        filename.replace(/[^a-zA-Z0-9\s_-]/g, "").trim() || "AudioRip";

      console.log(`[YTAudio Proxy] ✅ ${data.byteLength} bytes, ext: ${ext}`);
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${safeFilename}.${ext}"`,
          "Content-Length": data.byteLength.toString(),
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.warn(`[YTAudio Proxy] Attempt failed: ${err.message}`);
    }
  }

  // Proxy failed — signal client to download directly
  return new Response(JSON.stringify({ redirect: fileUrl }), {
    status: 421,
    headers: {
      "Content-Type": "application/json",
      "X-Proxy-Action": "direct-download",
      "X-Direct-URL": fileUrl,
    },
  });
}
