// app/sitemap.ts
import { MetadataRoute } from "next";

const baseUrl = "https://www.vidiflow.co";

// Update a page's date here ONLY when you actually change that page's content.
// Format: new Date("YYYY-MM-DD")
const lastMod = {
  homepage: new Date("2026-07-01"),

  tiktok: new Date("2026-07-01"),
  youtubeVideo: new Date("2026-07-01"),
  youtubeAudio: new Date("2026-07-01"),
  youtubeThumbnail: new Date("2026-07-01"),
  instagram: new Date("2026-07-01"),
  facebook: new Date("2026-07-01"),
  pinterest: new Date("2026-07-11"), // bumped: added new FAQ content today
  snapchat: new Date("2026-07-01"),
  twitter: new Date("2026-07-01"),
  linkedin: new Date("2026-07-01"),
  twitch: new Date("2026-07-01"),
  reddit: new Date("2026-07-01"),

  generateTags: new Date("2026-07-01"),
  generateDescription: new Date("2026-07-01"),

  exploreTools: new Date("2026-07-01"),
  blogIndex: new Date("2026-07-01"),
  about: new Date("2026-06-01"),
  privacy: new Date("2026-06-01"),

  blogYtMp3: new Date("2025-12-01"),
  blogPinterest: new Date("2025-12-01"),
  blogFacebook: new Date("2025-12-01"),
  blogSnapchat: new Date("2025-12-01"),
  blogTwitch: new Date("2025-12-01"),
  blogYtThumbnail: new Date("2025-12-01"),
  blogBestFree: new Date("2025-12-01"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: lastMod.homepage,
      changeFrequency: "weekly",
      priority: 1.0,
    },

    {
      url: `${baseUrl}/tiktok-video-downloader`,
      lastModified: lastMod.tiktok,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-video-downloader`,
      lastModified: lastMod.youtubeVideo,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-audio-downloader`,
      lastModified: lastMod.youtubeAudio,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-thumbnail-downloader`,
      lastModified: lastMod.youtubeThumbnail,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/instagram-video-downloader`,
      lastModified: lastMod.instagram,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/facebook-video-downloader`,
      lastModified: lastMod.facebook,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pinterest-video-downloader`,
      lastModified: lastMod.pinterest,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/snapchat-video-downloader`,
      lastModified: lastMod.snapchat,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/twitter-video-downloader`,
      lastModified: lastMod.twitter,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/linkedin-video-downloader`,
      lastModified: lastMod.linkedin,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/twitch-video-downloader`,
      lastModified: lastMod.twitch,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reddit-video-downloader`,
      lastModified: lastMod.reddit,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/generate-tags`,
      lastModified: lastMod.generateTags,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/generate-description`,
      lastModified: lastMod.generateDescription,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/explore-tools`,
      lastModified: lastMod.exploreTools,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: lastMod.blogIndex,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastMod.about,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: lastMod.privacy,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: `${baseUrl}/blog/youtube-to-mp3-converter-free-2025`,
      lastModified: lastMod.blogYtMp3,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/pinterest-video-downloader-free-2025`,
      lastModified: lastMod.blogPinterest,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/facebook-video-downloader-free-2025`,
      lastModified: lastMod.blogFacebook,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/snapchat-spotlight-downloader-free-2025`,
      lastModified: lastMod.blogSnapchat,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/twitch-clip-downloader-free-2025`,
      lastModified: lastMod.blogTwitch,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/youtube-thumbnail-downloader-free-2025`,
      lastModified: lastMod.blogYtThumbnail,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/best-free-video-downloader-every-platform-2025`,
      lastModified: lastMod.blogBestFree,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
