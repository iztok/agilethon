import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  bundlePagesRouterDependencies: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
