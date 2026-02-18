import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@merit-systems/echo-next-sdk'],
  serverActions: {
    bodySizeLimit: '4.5mb',
  },
};

export default nextConfig;
