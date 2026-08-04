import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@techtimeline/database", "@techtimeline/types", "@techtimeline/lib"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
    ];
  },
};

export default nextConfig;
