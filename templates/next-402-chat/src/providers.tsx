'use client';

import { EchoProvider } from '@merit-systems/echo-next-sdk/client';
import { WalletProvider } from '@/components/wallet';
import { PaymentModeProvider } from '@/components/wallet/payment-mode';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EchoProvider config={{ appId: process.env.NEXT_PUBLIC_ECHO_APP_ID! }}>
      <WalletProvider>
        <PaymentModeProvider>{children}</PaymentModeProvider>
      </WalletProvider>
    </EchoProvider>
  );
}
