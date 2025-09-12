import { NotFoundCard } from '@/components/error/card';

import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-card h-screen w-screen flex flex-col items-center justify-center">
        <NotFoundCard />
      </body>
    </html>
  );
}
