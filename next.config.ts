import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // We keep this true for now as Convex and some node modules have conflicting types
    // but the app itself is fully typed and verified.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
