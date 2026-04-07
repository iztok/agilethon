import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@clerk/nextjs", "@clerk/clerk-react", "@clerk/shared", "@clerk/react"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
