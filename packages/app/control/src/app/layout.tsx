import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { RootProvider } from 'fumadocs-ui/provider';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { TRPCReactProvider } from '@/trpc/client';
import { PostHogProvider } from '@/components/PostHogProvider';

import { Toaster } from '@/components/ui/sonner';

import type { Metadata } from 'next';
import type { Viewport } from 'next';

import { env } from '@/env';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Echo',
    template: '%s | Echo',
  },
  description: 'User Pays AI SDK',
  appleWebApp: {
    title: 'Echo',
    statusBarStyle: 'black-translucent',
  },
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
};

export const viewport: Viewport = {
  width: 'device-width',
  height: 'device-height',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090909' },
    { media: '(prefers-color-scheme: light)', color: 'white' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased bg-card">
          <RootProvider>
            <SpeedInsights />
            <Analytics />
            <TRPCReactProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                storageKey="echo-theme"
                enableSystem={true}
              >
                <PostHogProvider>
                  <Toaster />
                  <main>{children}</main>
                </PostHogProvider>
              </ThemeProvider>
            </TRPCReactProvider>
          </RootProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
