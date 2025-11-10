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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  typescript: {
    // Ignorer les erreurs TypeScript dans les Supabase Functions (Deno)
    ignoreBuildErrors: true,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  async redirects() {
    return [
      {
        source: '/boutique',
        destination: '/',
        permanent: true, // 301 redirect for SEO
      },
    ];
  },
};

export default nextConfig;
