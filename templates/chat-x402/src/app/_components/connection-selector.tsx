'use client';

import { Button } from '@/components/ui/button';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AuthModal } from './auth-modal';
import { WalletConnectButton } from './connect-button';
import { EchoAccount } from '@/components/echo-account-next';

export function ConnectionSelector() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isConnected } = useAccount();
  const { user } = useEcho();

  const isEchoConnected = !!user;
  const isWalletConnected = isConnected;

  if (isEchoConnected) {
    return (
      <div className="flex items-center gap-3">
        <EchoAccount />
      </div>
    );
  }

  if (isWalletConnected) {
    return (
      <div className="flex items-center gap-3">
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setAuthModalOpen(true)}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        Login
      </Button>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
