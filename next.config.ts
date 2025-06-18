import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://test-fe.mysellerpintar.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
