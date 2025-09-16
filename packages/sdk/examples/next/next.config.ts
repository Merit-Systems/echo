import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@merit-systems/echo-next-sdk',
    '@merit-systems/echo-react-sdk',
  ],
};

export default nextConfig;
