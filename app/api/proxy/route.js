// app/api/proxy/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new Response("No URL provided", { status: 400 });
  }

  // Security: only allow Pinterest CDN URLs
  const allowedHosts = ['pinimg.com', 'pinterest.com', 'v1.pinimg.com', 'i.pinimg.com'];
  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const isAllowed = allowedHosts.some(host => parsedUrl.hostname.endsWith(host));
  if (!isAllowed) {
    return new Response("URL not allowed", { status: 403 });
  }

  const isVideo = fileUrl.includes('.mp4') || fileUrl.includes('/videos/');

  // For images, build a fallback chain of resolutions to try
  // Pinterest doesn't always have /originals/ so we cascade down
  let urlsToTry = [fileUrl];

  if (!isVideo && fileUrl.includes('pinimg.com')) {
    const base = fileUrl; // always try the original URL first
    urlsToTry = [
      base,
      base.replace(/\/(originals|736x|474x|236x|170x)\//, '/originals/'),
      base.replace(/\/(originals|736x|474x|236x|170x)\//, '/736x/'),
      base.replace(/\/(originals|736x|474x|236x|170x)\//, '/474x/'),
      base.replace(/\/(originals|736x|474x|236x|170x)\//, '/236x/'),
    ];
    // Deduplicate while preserving order
    urlsToTry = [...new Set(urlsToTry)];
  }

  const fetchHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.pinterest.com/',
    'Accept': '*/*',
    'Accept-Encoding': 'identity',
  };

  let lastError = null;

  for (const tryUrl of urlsToTry) {
    try {
      const res = await fetch(tryUrl, { headers: fetchHeaders });

      // Skip this URL if CDN returns an error
      if (!res.ok) {
        lastError = `Upstream ${res.status} for ${tryUrl}`;
        console.warn(lastError);
        continue;
      }

      const data = await res.arrayBuffer();

      // Detect content type
      const upstreamContentType = res.headers.get('Content-Type') || '';
      const isVid = tryUrl.includes('.mp4') || upstreamContentType.includes('video');
      const isWebp = tryUrl.includes('.webp') || upstreamContentType.includes('webp');
      const isPng = tryUrl.includes('.png') || upstreamContentType.includes('png');

      let contentType = 'image/jpeg';
      let ext = 'jpg';

      if (isVid) {
        contentType = 'video/mp4';
        ext = 'mp4';
      } else if (isWebp) {
        contentType = 'image/webp';
        ext = 'webp';
      } else if (isPng) {
        contentType = 'image/png';
        ext = 'png';
      }

      // Sanity check: make sure we got actual image/video bytes, not an error HTML page
      if (!isVid && data.byteLength < 1000) {
        lastError = `Response too small (${data.byteLength} bytes), likely not a real image`;
        console.warn(lastError);
        continue;
      }

      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="PinSave-${Date.now()}.${ext}"`,
          "Content-Length": data.byteLength.toString(),
          "Cache-Control": "no-store",
        },
      });

    } catch (err) {
      lastError = err.message;
      console.error(`Proxy fetch error for ${tryUrl}:`, err.message);
      continue;
    }
  }

  // All URLs failed
  return new Response(`Download failed: ${lastError}`, { status: 500 });
}