import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rnxhkjvcixumuvjfxdjo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // Ignorer les erreurs TypeScript dans les Supabase Functions (Deno)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
