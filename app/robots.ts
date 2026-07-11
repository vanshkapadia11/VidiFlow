// app/robots.ts
// Place this file at: app/robots.ts
// Accessible at: vidiflow,co/robots.txt (Next.js handles this automatically)

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // don't index API routes
          "/_next/", // don't index Next.js internals
        ],
      },
    ],
    sitemap: "https://vidiflow.co/sitemap.xml",
    // host: "https://vidiflow.co",
  };
}
