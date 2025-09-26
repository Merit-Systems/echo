import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
