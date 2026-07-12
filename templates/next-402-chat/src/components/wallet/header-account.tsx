'use client';

import { EchoAccount } from '@/components/echo-account-next';
import { usePaymentMode } from './payment-mode';
import { WalletConnectButton } from './connect-button';

export function HeaderAccount() {
  const { paymentMode } = usePaymentMode();

  if (paymentMode === 'x402') {
    return <WalletConnectButton />;
  }

  return <EchoAccount />;
}
