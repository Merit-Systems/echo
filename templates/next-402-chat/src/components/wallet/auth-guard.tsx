'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { Button } from '@/components/ui/button';
import { usePaymentMode } from './payment-mode';
import { WalletConnectButton } from './connect-button';

interface AuthGuardProps {
  children: React.ReactNode;
  isEchoSignedIn: boolean;
}

export function AuthGuard({ children, isEchoSignedIn }: AuthGuardProps) {
  const { isConnected } = useAccount();
  const { paymentMode, setPaymentMode } = usePaymentMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isAuthenticated =
    paymentMode === 'credits' ? isEchoSignedIn : isConnected;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl text-gray-900 tracking-tight dark:text-white">
              Echo Demo App
            </h2>
            <p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
              Choose how to pay for chat requests
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
              <Button
                type="button"
                variant={paymentMode === 'credits' ? 'default' : 'ghost'}
                onClick={() => setPaymentMode('credits')}
              >
                Echo Credits
              </Button>
              <Button
                type="button"
                variant={paymentMode === 'x402' ? 'default' : 'ghost'}
                onClick={() => setPaymentMode('x402')}
              >
                USDC (x402)
              </Button>
            </div>

            {paymentMode === 'credits' ? (
              <SignInButton />
            ) : (
              <div className="flex justify-center">
                <WalletConnectButton />
              </div>
            )}

            <div className="text-gray-500 text-xs dark:text-gray-400">
              {paymentMode === 'credits'
                ? 'Sign in to pay with Echo credits'
                : 'Connect a wallet to pay with USDC over x402'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
