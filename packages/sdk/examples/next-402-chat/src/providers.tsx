'use client';

import { EchoProvider } from '@merit-systems/echo-next-sdk/client';
import { WalletProvider } from '@/components/wallet';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EchoProvider config={{ appId: process.env.NEXT_PUBLIC_ECHO_APP_ID! }}>
      <WalletProvider>{children}</WalletProvider>
    </EchoProvider>
  );
}
