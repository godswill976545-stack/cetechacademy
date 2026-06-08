import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kohlegvunumiwxbhfbwb.supabase.co',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};
 
export default nextConfig;
