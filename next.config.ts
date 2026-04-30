import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});


const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "stripe"],

  // ── Optimize heavy packages so they tree-shake properly ──
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@clerk/nextjs",
      "embla-carousel-react",
      "radix-ui",
      "date-fns", // add this
      "sonner", // add this
      "@stripe/stripe-js", // add this
    ],
    optimizeCss: true, // ← add this, fixes render-blocking CSS
  },

  // ── Compress responses ──
  compress: true,

  // ── Image optimization ──
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ── Stop shipping legacy JS polyfills to modern browsers ──
  // Add this to package.json instead (see below)

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "vidiflow.co" }],
        destination: "https://www.vidiflow.co/:path*",
        permanent: true,
      },
    ];
  },

  // ── Cache headers for static assets ──
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

// export default nextConfig;

  export default withBundleAnalyzer(nextConfig);