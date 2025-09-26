'use client';

import { EchoProvider } from '@merit-systems/echo-next-sdk/client';
import { WagmiProvider } from 'wagmi';
import { config } from './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EchoProvider config={{ appId: process.env.NEXT_PUBLIC_ECHO_APP_ID! }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </EchoProvider>
  );
}
