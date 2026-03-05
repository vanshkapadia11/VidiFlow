// app/api/youtube-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `YTSave-${Date.now()}`;

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // ── Allowed CDN hosts ──────────────────────────────────────────────────
  // NOTE: googlevideo.com is intentionally NOT proxied (signed IPs, always 403)
  // Those are handled as direct client-side downloads in the UI fallback
  const allowedPatterns = [
    // Third-party converter CDNs
    "y2mate.com",
    "y2mate.nu",
    "cdn.y2mate.com",
    "savefrom.net",
    "sf-cdn.net",
    "sf-tools.com",
    "cobalt.tools",
    "ytsave.net",
    "ytcdn.net",
    "loader.to",
    // yt5s / yt1s converted file CDNs
    "yt5s.io",
    "yt1s.com",
    "cdn.yt5s.io",
    // y2down
    "y2down.cc",
    "cdn.y2down.cc",
    // invidious instances
    "invidious.privacyredirect.com",
    "inv.nadeko.net",
    "invidious.nerdvpn.de",
    "yt.artemislena.eu",
    // Generic video CDNs that converters use
    "akamaized.net",
    "cloudfront.net",
    "fastly.net",
  ];

  const isAllowed = allowedPatterns.some(
    (p) =>
      parsedUrl.hostname === p ||
      parsedUrl.hostname.endsWith("." + p) ||
      parsedUrl.hostname.includes(p),
  );

  // googlevideo.com = YouTube's own CDN, signed to client IP — proxy always 403s
  // Return a special signal so the UI can do a direct client-side download instead
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

  if (!isAllowed) {
    console.warn("[YTSave Proxy] Blocked host:", parsedUrl.hostname);
    return new Response("URL not allowed: " + parsedUrl.hostname, {
      status: 403,
    });
  }

  // ── Try to stream with multiple User-Agents ────────────────────────────
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  for (const ua of userAgents) {
    try {
      const res = await fetch(fileUrl, {
        headers: {
          "User-Agent": ua,
          Referer: "https://www.youtube.com/",
          Origin: "https://www.youtube.com",
          Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "identity",
          Range: "bytes=0-",
          // Some CDNs need these to serve the file
          "Sec-Fetch-Dest": "video",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "cross-site",
        },
      });

      console.log(
        `[YTSave Proxy] ${parsedUrl.hostname} → ${res.status} (UA: ${ua.substring(0, 30)}...)`,
      );

      if (!res.ok && res.status !== 206) continue;

      const data = await res.arrayBuffer();
      if (data.byteLength < 1000) continue;

      // Detect file type from content-type or URL
      const ct = res.headers.get("content-type") || "";
      const isAudio = ct.includes("audio/") || fileUrl.includes(".mp3");
      const ext = isAudio ? "mp3" : "mp4";
      const contentType = isAudio ? "audio/mpeg" : "video/mp4";

      const safeFilename =
        filename.replace(/[^a-zA-Z0-9\s_-]/g, "").trim() || "YTSave";

      console.log(`[YTSave Proxy] ✅ Success: ${data.byteLength} bytes`);
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
      console.warn(`[YTSave Proxy] Attempt failed: ${err.message}`);
      continue;
    }
  }

  // All attempts failed — tell the client to download directly
  return new Response(JSON.stringify({ redirect: fileUrl }), {
    status: 421,
    headers: {
      "Content-Type": "application/json",
      "X-Proxy-Action": "direct-download",
      "X-Direct-URL": fileUrl,
    },
  });
}
