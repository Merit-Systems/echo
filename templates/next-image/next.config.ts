import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@merit-systems/echo-next-sdk'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
