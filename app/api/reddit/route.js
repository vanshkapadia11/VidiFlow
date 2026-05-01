// app/api/reddit/route.js
import { NextResponse } from "next/server";

function extractRedditInfo(url) {
  url = url.trim().replace(/\?.*$/, "");
  const patterns = [
    /reddit\.com\/r\/[^/]+\/comments\/([a-zA-Z0-9]+)/,
    /redd\.it\/([a-zA-Z0-9]+)/,
    /reddit\.com\/video\/([a-zA-Z0-9]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Extract all images from a Reddit post object
function extractImages(post) {
  const images = [];
  const seen = new Set();

  const add = (url) => {
    if (!url || seen.has(url)) return;
    // Skip thumbnails/icons/avatars — only want full-res
    if (
      url.includes("thumbs.") ||
      url.includes("icon_") ||
      url.includes("snoo")
    )
      return;
    seen.add(url);
    images.push(url);
  };

  // 1. Gallery posts — media_metadata contains full-res images
  if (post.media_metadata) {
    // gallery_data preserves the order
    const order =
      post.gallery_data?.items?.map((i) => i.media_id) ||
      Object.keys(post.media_metadata);
    for (const id of order) {
      const meta = post.media_metadata[id];
      if (!meta) continue;
      if (meta.status !== "valid") continue;
      // s = source (full resolution)
      const src = meta.s?.u || meta.s?.gif;
      if (src) add(src.replace(/&amp;/g, "&"));
    }
  }

  // 2. Single image post (post_hint: "image")
  if (post.url && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(post.url)) {
    add(post.url);
  }

  // 3. preview images as fallback
  const previews = post.preview?.images || [];
  for (const p of previews) {
    const src = p.source?.url;
    if (src) add(src.replace(/&amp;/g, "&"));
  }

  return images;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log("[Reddit] Input URL:", url);

    const postId = extractRedditInfo(url);
    if (!postId) {
      return NextResponse.json(
        { error: "Invalid Reddit URL. Paste a reddit post link." },
        { status: 400 },
      );
    }

    console.log("[Reddit] Post ID:", postId);

    // ── STRATEGY A: Reddit JSON API ──
    try {
      console.log("[Reddit] Trying Reddit JSON API...");

      const apiUrls = [
        `https://www.reddit.com/comments/${postId}.json`,
        `https://reddit.com/comments/${postId}/.json`,
      ];

      for (const apiUrl of apiUrls) {
        const res = await fetch(apiUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const post = data?.[0]?.data?.children?.[0]?.data;
        if (!post) continue;

        console.log("[Reddit] Post found:", post.title);

        const images = extractImages(post);
        console.log("[Reddit] Images found:", images.length);

        // ── Video post ──
        const media = post.media || post.secure_media;
        const redditVideo = media?.reddit_video;

        if (redditVideo) {
          const videoUrl =
            redditVideo.fallback_url?.replace("?source=fallback", "") ||
            redditVideo.dash_url;
          const audioUrl = videoUrl
            ?.replace(/\/DASH_\d+/, "/DASH_audio")
            .replace(/\/DASH_[^/]+\.mp4/, "/DASH_audio.mp4");

          const formats = [];
          const height = redditVideo.height || 720;
          const qualityOptions = [1080, 720, 480, 360, 240].filter(
            (q) => q <= height,
          );

          for (const quality of qualityOptions) {
            const qUrl = videoUrl?.replace(/DASH_\d+/, `DASH_${quality}`);
            if (qUrl) {
              formats.push({
                quality: `${quality}p`,
                url: qUrl,
                label: `${quality}p MP4`,
                hasAudio: false,
              });
            }
          }

          if (formats.length === 0 && videoUrl) {
            formats.push({
              quality: "Source",
              url: videoUrl,
              label: "Source Quality",
              hasAudio: false,
            });
          }

          console.log("[Reddit] ✅ Video + images found");
          return NextResponse.json({
            success: true,
            type: "video",
            postId,
            title: post.title || "Reddit Video",
            subreddit: post.subreddit || "",
            author: post.author || "",
            thumbnail:
              post.thumbnail !== "default" && post.thumbnail !== "self"
                ? post.thumbnail
                : null,
            duration: redditVideo.duration || 0,
            formats,
            images,
            defaultUrl: formats[0]?.url || videoUrl,
            audioUrl,
            note: "Reddit stores audio and video separately. Download and merge for best quality.",
          });
        }

        // ── YouTube redirect ──
        if (
          post.url &&
          (post.url.includes("youtube.com") || post.url.includes("youtu.be"))
        ) {
          return NextResponse.json(
            {
              error:
                "This Reddit post links to YouTube. Use our YouTube downloader instead!",
              redirectTo: "/youtube-video-downloader",
            },
            { status: 400 },
          );
        }

        // ── GIF/gifv ──
        if (
          post.url &&
          (post.url.endsWith(".gif") || post.url.endsWith(".gifv"))
        ) {
          const mp4Url = post.url
            .replace(".gifv", ".mp4")
            .replace(".gif", ".mp4");
          return NextResponse.json({
            success: true,
            type: "gif",
            postId,
            title: post.title || "Reddit GIF",
            subreddit: post.subreddit || "",
            author: post.author || "",
            thumbnail: post.thumbnail || null,
            formats: [{ quality: "Source", url: mp4Url, label: "MP4" }],
            images: [],
            defaultUrl: mp4Url,
          });
        }

        // ── v.redd.it ──
        if (post.url && post.url.includes("v.redd.it")) {
          return NextResponse.json({
            success: true,
            type: "video",
            postId,
            title: post.title || "Reddit Video",
            subreddit: post.subreddit || "",
            author: post.author || "",
            thumbnail: post.thumbnail || null,
            formats: [
              {
                quality: "720p",
                url: `${post.url}/DASH_720.mp4`,
                label: "720p MP4",
              },
              {
                quality: "480p",
                url: `${post.url}/DASH_480.mp4`,
                label: "480p MP4",
              },
              {
                quality: "360p",
                url: `${post.url}/DASH_360.mp4`,
                label: "360p MP4",
              },
            ],
            images,
            defaultUrl: `${post.url}/DASH_720.mp4`,
          });
        }

        // ── Image-only post ──
        if (images.length > 0) {
          console.log("[Reddit] ✅ Image post");
          return NextResponse.json({
            success: true,
            type: "image",
            postId,
            title: post.title || "Reddit Post",
            subreddit: post.subreddit || "",
            author: post.author || "",
            thumbnail: images[0] || null,
            duration: 0,
            formats: [],
            images,
            defaultUrl: null,
          });
        }

        return NextResponse.json(
          {
            error:
              "This post doesn't contain downloadable media. Only video, image, and gallery posts are supported.",
          },
          { status: 404 },
        );
      }
    } catch (e) {
      console.error("[Reddit] JSON API failed:", e.message);
    }

    // ── STRATEGY B: Cobalt.tools ──
    try {
      console.log("[Reddit] Trying cobalt.tools...");
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
          console.log("[Reddit] ✅ cobalt success");
          return NextResponse.json({
            success: true,
            type: "video",
            postId,
            title: "Reddit Video",
            subreddit: "",
            author: "",
            thumbnail: null,
            formats: [{ quality: "Best", url: d.url, label: "Best Quality" }],
            images: [],
            defaultUrl: d.url,
          });
        }
      }
    } catch (e) {
      console.error("[Reddit] cobalt failed:", e.message);
    }

    return NextResponse.json(
      {
        error:
          "Could not extract media. Make sure the post is public and contains a video or image.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[Reddit] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
