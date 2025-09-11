import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// @ts-expect-error - No type declarations available for this package
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const CORS_HEADERS = [
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: '*' },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    authInterrupts: true,
    globalNotFound: true,
  },
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'erjkmxp9url451wi.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'sbaaxpd5ro061s4a.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '**',
      },
    ],
  },
  transpilePackages: ['x402-next'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/oauth/:path*',
        headers: CORS_HEADERS,
      },
      {
        source: '/api/v1/:path*',
        headers: CORS_HEADERS,
      },
      {
        source: '/api/validate-jwt-token',
        headers: CORS_HEADERS,
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
};

export default withMDX(nextConfig);
