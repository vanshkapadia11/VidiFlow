export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || `LISave-${Date.now()}`;

  if (!fileUrl) return new Response("No URL", { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const isAllowed =
    parsedUrl.hostname.includes("linkedin") ||
    parsedUrl.hostname.includes("licdn") ||
    parsedUrl.hostname.includes("media");
  if (!isAllowed) return new Response("URL not allowed", { status: 403 });

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.linkedin.com/",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });
    if (!res.ok)
      return new Response(`Error: ${res.status}`, { status: res.status });
    const data = await res.arrayBuffer();
    if (data.byteLength < 1000)
      return new Response("File too small", { status: 502 });
    return new Response(data, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}.mp4"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response("Failed: " + err.message, { status: 500 });
  }
}
