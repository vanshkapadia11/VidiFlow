// app/sitemap.ts
// Place this file at: app/sitemap.ts
// Accessible at: vidiflow.com/sitemap.xml (Next.js handles this automatically)

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vidiflow.co";
  const lastModified = new Date();

  return [
    // ── HOMEPAGE ─────────────────────────────────────────────────────────────
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // ── VIDEO DOWNLOADERS ─────────────────────────────────────────────────────
    {
      url: `${baseUrl}/tiktok-video-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-video-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-audio-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-thumbnail-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/instagram-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/facebook-video-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pinterest-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/snapchat-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/twitter-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/linkedin-video-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/twitch-downloader`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // ── CREATOR TOOLS ─────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/viral-tags`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/creator-architect`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // ── OTHER PAGES ───────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
