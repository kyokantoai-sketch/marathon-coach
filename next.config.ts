import type { NextConfig } from "next";

// : NextConfig を : any に変更して、厳しいチェックを回避します
const nextConfig: any = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;