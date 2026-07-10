'use client';

import { useAccount } from 'wagmi';
import { WalletConnectButton } from './connect-button';
import { EchoAccount } from '@/components/echo-account-next';

export function HeaderAccount() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <WalletConnectButton />;
  }

  return <EchoAccount />;
}
