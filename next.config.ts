import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Allow larger payloads for server actions (image upload)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // or '5mb', '20mb'
    },
  },
  images: {
    // In dev, disable Next's image optimizer to avoid noisy "upstream image response timed out"
    // logs when remote image hosts are slow/unreachable. Production stays optimized.
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
