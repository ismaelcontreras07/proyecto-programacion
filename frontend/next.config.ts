import type { NextConfig } from "next";
import path from "node:path";

const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendBaseUrl}/uploads/:path*`,
      },
      {
        source: "/docs",
        destination: `${backendBaseUrl}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${backendBaseUrl}/openapi.json`,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
