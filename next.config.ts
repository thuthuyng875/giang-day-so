import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  typescript: {
    // Bỏ qua lỗi TypeScript khi build trên Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
