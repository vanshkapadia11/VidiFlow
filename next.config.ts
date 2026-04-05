import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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