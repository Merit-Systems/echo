'use client';

import React from 'react';

import { EchoProvider } from '@merit-systems/echo-next-sdk/client';

const appId = process.env.NEXT_PUBLIC_ECHO_APP_ID!;

if (!appId) {
  throw new Error('NEXT_PUBLIC_ECHO_APP_ID environment variable is required');
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <EchoProvider config={{ appId: appId }}>{children}</EchoProvider>;
}
