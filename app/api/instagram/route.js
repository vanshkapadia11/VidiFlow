// app/api/instagram/route.js
import { NextResponse } from "next/server";

const RENDER_URL = process.env.YTDLP_API_URL || "";
const RENDER_SECRET = process.env.YTDLP_API_SECRET || "";

export async function POST(req) {
  try {
    const body = await req.json();
    const url = body?.url?.trim();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("[Instagram] Input URL:", url);

    // ── STRATEGY 1: Render yt-dlp service ─────────────────────────────────
    if (RENDER_URL) {
      try {
        console.log("[Instagram] Trying Render service...");
        const res = await fetch(`${RENDER_URL}/instagram/info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-secret": RENDER_SECRET,
          },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(30000),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            console.log("[Instagram] ✅ Render success");
            return NextResponse.json(data);
          }
        }

        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          return NextResponse.json(
            { error: errData.error },
            { status: res.status },
          );
        }
      } catch (e) {
        console.error("[Instagram] Render error:", e.message);
      }
    }

    // ── STRATEGY 2: Direct yt-dlp style scraping ──────────────────────────
    try {
      console.log("[Instagram] Trying direct scrape...");

      // Clean URL
      const cleanUrl = url.split("?")[0].replace(/\/$/, "");
      const apiUrl = `${cleanUrl}/?__a=1&__d=dis`;

      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.instagram.com/",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const media = data?.graphql?.shortcode_media || data?.items?.[0];

        if (media) {
          const videoUrl = media.video_url;
          const thumbnail = media.display_url || media.thumbnail_url || "";
          const caption =
            media.edge_media_to_caption?.edges?.[0]?.node?.text || "";

          if (videoUrl) {
            console.log("[Instagram] ✅ Direct scrape success");
            return NextResponse.json({
              success: true,
              type: "video",
              url,
              title: caption.substring(0, 100) || "Instagram Video",
              author: media.owner?.username || "",
              thumbnail,
              duration: media.video_duration || 0,
              formats: [{ quality: "HD", url: videoUrl, label: "HD MP4" }],
              defaultUrl: videoUrl,
            });
          }
        }
      }
    } catch (e) {
      console.error("[Instagram] Direct scrape failed:", e.message);
    }

    // ── STRATEGY 3: Cobalt.tools ──────────────────────────────────────────
    try {
      console.log("[Instagram] Trying cobalt.tools...");
      const cobaltRes = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({ url, filenameStyle: "classic" }),
        signal: AbortSignal.timeout(15000),
      });

      if (cobaltRes.ok) {
        const d = await cobaltRes.json();
        if (
          (d.status === "stream" ||
            d.status === "redirect" ||
            d.status === "tunnel") &&
          d.url
        ) {
          console.log("[Instagram] ✅ Cobalt success");
          return NextResponse.json({
            success: true,
            type: "video",
            url,
            title: "Instagram Video",
            author: "",
            thumbnail: null,
            formats: [{ quality: "HD", url: d.url, label: "HD MP4" }],
            defaultUrl: d.url,
          });
        }
      }
    } catch (e) {
      console.error("[Instagram] Cobalt failed:", e.message);
    }

    return NextResponse.json(
      {
        error:
          "Could not extract Instagram video. Make sure the account is public.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[Instagram] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
