// app/api/twitch/route.js
import { NextResponse } from "next/server";

function extractTwitchInfo(url) {
  // Clip: https://www.twitch.tv/clip/ClipName or https://clips.twitch.tv/ClipName
  const clipPatterns = [
    /twitch\.tv\/[^/]+\/clip\/([a-zA-Z0-9_-]+)/,
    /clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/,
    /twitch\.tv\/clip\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of clipPatterns) {
    const m = url.match(p);
    if (m) return { type: "clip", id: m[1] };
  }

  // VOD: https://www.twitch.tv/videos/123456789
  const vodMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (vodMatch) return { type: "vod", id: vodMatch[1] };

  return null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[TwitchSave] Input URL:", url);

    const info = extractTwitchInfo(url);
    console.log("[TwitchSave] Parsed:", info);

    if (!info) {
      return NextResponse.json(
        { error: "Invalid Twitch URL. Paste a clip or VOD link." },
        { status: 400 },
      );
    }

    // ── STRATEGY A: Twitch GQL API (official, no auth for clips) ──
    if (info.type === "clip") {
      try {
        console.log("[TwitchSave] Trying Twitch GQL for clip...");

        // Twitch Client-ID (public, used by their own web app)
        const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

        const gqlRes = await fetch("https://gql.twitch.tv/gql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-ID": CLIENT_ID,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: JSON.stringify([
            {
              operationName: "VideoAccessToken_Clip",
              variables: { slug: info.id },
              extensions: {
                persistedQuery: {
                  version: 1,
                  sha256Hash:
                    "36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11",
                },
              },
            },
          ]),
        });

        if (gqlRes.ok) {
          const gqlData = await gqlRes.json();
          console.log(
            "[TwitchSave] GQL response clip:",
            JSON.stringify(gqlData).substring(0, 400),
          );

          const clip = gqlData?.[0]?.data?.clip;
          if (clip) {
            const token = clip.playbackAccessToken;
            const videoQualities = clip.videoQualities || [];

            const formats = videoQualities
              .map((q) => ({
                quality: q.quality ? `${q.quality}p` : "Unknown",
                frameRate: q.frameRate || "",
                url: q.sourceURL
                  ? `${q.sourceURL}?sig=${token?.signature}&token=${encodeURIComponent(token?.value || "")}`
                  : null,
                label: q.quality
                  ? `${q.quality}p${q.frameRate ? ` ${q.frameRate}fps` : ""}`
                  : "Unknown",
              }))
              .filter((f) => f.url);

            if (formats.length > 0) {
              console.log(
                "[TwitchSave] ✅ GQL clip success, formats:",
                formats.length,
              );
              return NextResponse.json({
                type: "clip",
                clipId: info.id,
                formats,
                defaultUrl: formats[0].url,
                thumbnail: clip.thumbnailURL || null,
                title: clip.title || "Twitch Clip",
                broadcaster: clip.broadcaster?.displayName || "",
                game: clip.game?.name || "",
                duration: clip.durationSeconds || 0,
                views: clip.viewCount || 0,
                success: true,
              });
            }
          }
        }
      } catch (e) {
        console.error("[TwitchSave] GQL clip failed:", e.message);
      }
    }

    // ── STRATEGY B: Twitch GQL for VOD ──
    if (info.type === "vod") {
      try {
        console.log("[TwitchSave] Trying Twitch GQL for VOD...");
        const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

        const gqlRes = await fetch("https://gql.twitch.tv/gql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-ID": CLIENT_ID,
            "User-Agent": "Mozilla/5.0",
          },
          body: JSON.stringify([
            {
              operationName: "PlaybackAccessToken_Template",
              query: `query PlaybackAccessToken_Template($login: String, $isLive: Boolean!, $vodID: ID, $isVod: Boolean!, $playerType: String!) {
                streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature }
                videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature }
              }`,
              variables: {
                isLive: false,
                login: "",
                isVod: true,
                vodID: info.id,
                playerType: "site",
              },
            },
          ]),
        });

        if (gqlRes.ok) {
          const gqlData = await gqlRes.json();
          const token = gqlData?.[0]?.data?.videoPlaybackAccessToken;
          console.log("[TwitchSave] VOD token:", token ? "found" : "not found");

          if (token) {
            // Build M3U8 playlist URL
            const m3u8Url = `https://usher.twitchapps.com/vod/${info.id}?sig=${token.signature}&token=${encodeURIComponent(token.value)}&allow_source=true&allow_spectre=true&allow_audio_only=true`;

            // Fetch playlist to get quality options
            const m3u8Res = await fetch(m3u8Url, {
              headers: { "User-Agent": "Mozilla/5.0" },
            });

            if (m3u8Res.ok) {
              const m3u8Text = await m3u8Res.text();
              console.log("[TwitchSave] M3U8 length:", m3u8Text.length);

              // Parse quality variants from master playlist
              const formats = [];
              const lines = m3u8Text.split("\n");
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith("#EXT-X-STREAM-INF")) {
                  const resMatch = line.match(/RESOLUTION=(\d+x\d+)/);
                  const nameMatch = line.match(/VIDEO="([^"]+)"/);
                  const nextLine = lines[i + 1]?.trim();
                  if (nextLine && nextLine.startsWith("http")) {
                    const res = resMatch ? resMatch[1] : "";
                    const name = nameMatch ? nameMatch[1] : res || "source";
                    formats.push({
                      quality: name,
                      resolution: res,
                      url: nextLine,
                      label: name === "chunked" ? "Source Quality" : `${name}`,
                      isM3u8: true,
                    });
                  }
                }
              }

              // Get VOD metadata
              let title = "Twitch VOD";
              let thumbnail = null;
              let broadcaster = "";
              try {
                const metaRes = await fetch("https://gql.twitch.tv/gql", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Client-ID": CLIENT_ID,
                  },
                  body: JSON.stringify([
                    {
                      operationName: "VideoMetadata",
                      variables: { channelLogin: "", videoID: info.id },
                      extensions: {
                        persistedQuery: {
                          version: 1,
                          sha256Hash:
                            "45111672eea2e507f2d1fa11c7ca64c4f3d50beb21deef8d0c0bcd25fbc09bbe",
                        },
                      },
                    },
                  ]),
                });
                if (metaRes.ok) {
                  const metaData = await metaRes.json();
                  const video = metaData?.[0]?.data?.video;
                  if (video) {
                    title = video.title || title;
                    thumbnail = video.previewThumbnailURL || null;
                    broadcaster = video.owner?.displayName || "";
                  }
                }
              } catch (e) {}

              if (formats.length > 0) {
                console.log(
                  "[TwitchSave] ✅ VOD M3U8 success, formats:",
                  formats.length,
                );
                return NextResponse.json({
                  type: "vod",
                  vodId: info.id,
                  formats,
                  defaultUrl: formats[0].url,
                  thumbnail,
                  title,
                  broadcaster,
                  isM3u8: true,
                  success: true,
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("[TwitchSave] GQL VOD failed:", e.message);
      }
    }

    // ── STRATEGY C: clipr.co for clips ──
    if (info.type === "clip") {
      try {
        console.log("[TwitchSave] Trying clipr.co...");
        const cliprRes = await fetch(`https://clipr.co/clip/${info.id}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (cliprRes.ok) {
          const html = await cliprRes.text();
          const mp4Match = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
          const thumbMatch = html.match(
            /<img[^>]+src="(https:\/\/[^"]+clips-media[^"]+)"/,
          );
          const titleMatch = html.match(/<title>([^<]+)<\/title>/);

          if (mp4Match) {
            console.log("[TwitchSave] ✅ clipr.co success");
            return NextResponse.json({
              type: "clip",
              clipId: info.id,
              formats: [
                {
                  quality: "Source",
                  url: mp4Match[1],
                  label: "Source Quality",
                },
              ],
              defaultUrl: mp4Match[1],
              thumbnail: thumbMatch ? thumbMatch[1] : null,
              title: titleMatch
                ? titleMatch[1].replace(" - Clipr", "").trim()
                : "Twitch Clip",
              broadcaster: "",
              success: true,
            });
          }
        }
      } catch (e) {
        console.error("[TwitchSave] clipr.co failed:", e.message);
      }
    }

    // ── STRATEGY D: twitch-tools.rootonline.de ──
    try {
      console.log("[TwitchSave] Trying twitch-tools...");
      const ttRes = await fetch(
        "https://twitch-tools.rootonline.de/api/twitch_download.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            Referer: "https://twitch-tools.rootonline.de/",
          },
          body: JSON.stringify({ url }),
        },
      );

      if (ttRes.ok) {
        const ttData = await ttRes.json();
        if (ttData.links && ttData.links.length > 0) {
          const formats = ttData.links.map((l) => ({
            quality: l.quality || "HD",
            url: l.url,
            label: l.quality || "HD",
          }));
          console.log("[TwitchSave] ✅ twitch-tools success");
          return NextResponse.json({
            type: info.type,
            formats,
            defaultUrl: formats[0].url,
            thumbnail: ttData.thumbnail || null,
            title: ttData.title || "Twitch Video",
            broadcaster: ttData.channel || "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[TwitchSave] twitch-tools failed:", e.message);
    }

    // ── STRATEGY E: cobalt.tools ──
    try {
      console.log("[TwitchSave] Trying cobalt.tools...");
      const cobaltRes = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
          url,
          videoQuality: "1080",
          filenameStyle: "classic",
        }),
      });

      if (cobaltRes.ok) {
        const d = await cobaltRes.json();
        if (
          (d.status === "stream" ||
            d.status === "redirect" ||
            d.status === "tunnel") &&
          d.url
        ) {
          console.log("[TwitchSave] ✅ cobalt success");
          return NextResponse.json({
            type: info.type,
            formats: [{ quality: "Best", url: d.url, label: "Best Quality" }],
            defaultUrl: d.url,
            thumbnail: null,
            title: "Twitch Video",
            broadcaster: "",
            success: true,
          });
        }
      }
    } catch (e) {
      console.error("[TwitchSave] cobalt failed:", e.message);
    }

    console.log("[TwitchSave] ❌ All strategies failed");
    return NextResponse.json(
      {
        success: false,
        error: "Could not extract video. Make sure the clip or VOD is public.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[TwitchSave] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
