import type { NextConfig } from "next";

const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Allow larger payloads for server actions (image upload)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // or '5mb', '20mb'
    },
  },
  images: {
    // Keep optimization enabled in production for better LCP/SEO.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thejwel.com",
      },
      {
        protocol: "https",
        hostname: "battulaaljewels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ],
  },
};

export default nextConfig;
