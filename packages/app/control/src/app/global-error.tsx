'use client';

import { ErrorCard } from '@/components/error/card';

import type { Metadata } from 'next';
import type { NextErrorProps } from '@/types/next-error';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Error',
  description: 'An error has occurred.',
};

export default function GlobalError(props: NextErrorProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-card h-screen w-screen flex flex-col items-center justify-center">
        <ErrorCard errorProps={props} />
      </body>
    </html>
  );
}
