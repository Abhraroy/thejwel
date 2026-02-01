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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
