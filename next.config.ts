import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "stripe"],

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
};

export default nextConfig;