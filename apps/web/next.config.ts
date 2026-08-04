import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@techtimeline/ui",
    "@techtimeline/database",
    "@techtimeline/auth",
    "@techtimeline/types",
    "@techtimeline/lib",
  ],
};

export default nextConfig;
