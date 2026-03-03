// app/api/snapchat-proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `SnapSave-${Date.now()}`;

  if (!fileUrl) return new Response("No URL provided", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // Allow Snapchat CDN domains
  const allowedPatterns = [
    "snapchat.com",
    "sc-cdn.net",
    "snap-storage-production.storage.googleapis.com",
    "cf-st.sc-cdn.net",
    "snapsave.app",
    "snapsave.io",
  ];

  const isAllowed = allowedPatterns.some((p) => parsedUrl.hostname.endsWith(p));
  if (!isAllowed) {
    // Broad allow for any snap CDN subdomain
    const isSnapCdn =
      parsedUrl.hostname.includes("snap") ||
      parsedUrl.hostname.includes("sc-cdn");
    if (!isSnapCdn) {
      console.warn("[SnapProxy] Blocked host:", parsedUrl.hostname);
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
        Referer: "https://www.snapchat.com/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });

    if (!res.ok) {
      return new Response(`Upstream error: ${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }

    const data = await res.arrayBuffer();

    if (data.byteLength < 1000) {
      return new Response("File too small — likely an error response", {
        status: 502,
      });
    }

    const upstreamContentType = res.headers.get("Content-Type") || "video/mp4";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": upstreamContentType.includes("video")
          ? upstreamContentType
          : "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}.mp4"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[SnapProxy] Error:", err);
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
