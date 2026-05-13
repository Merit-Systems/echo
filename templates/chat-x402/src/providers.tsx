'use client';

import React from 'react';

import { wagmiConfig } from '@/lib/wagmi-config';
import { EchoProvider } from '@merit-systems/echo-next-sdk/client';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const appId = process.env.NEXT_PUBLIC_ECHO_APP_ID!;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <EchoProvider config={{ appId }}>{children}</EchoProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
