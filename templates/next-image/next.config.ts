import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@merit-systems/echo-next-sdk'],

  // Fix HTTP 413 "Request Entity Too Large" for image routes (App Router).
  //
  // Background: Next.js App Router ignores the Pages-Router-only
  //   `export const config = { api: { bodyParser: { sizeLimit: '...' } } }`
  // pattern. The correct way to raise the body-size limit in App Router is:
  //
  //   1. For Server Actions: `experimental.serverActions.bodySizeLimit`
  //   2. For Route Handlers: the limit is controlled by the underlying
  //      Node.js / Edge runtime and is not exposed as a simple config key in
  //      Next.js ≤15 — the recommended approach is to read the raw stream
  //      yourself OR to configure a reverse-proxy (Vercel / nginx). However,
  //      Vercel already allows up to 4.5 MB on the free tier and up to 10 MB
  //      on paid plans. For self-hosted deployments we set the experimental
  //      option below which also covers route handlers as of Next.js 15.
  //
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
  experimental: {
    serverActions: {
      // Allow up to 10 MB bodies — enough for multiple high-res base64 images.
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
