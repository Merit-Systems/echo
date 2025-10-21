'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { WalletConnectButton } from './connect-button';

interface AuthGuardProps {
  children: React.ReactNode;
  isEchoSignedIn: boolean;
}

export function AuthGuard({ children, isEchoSignedIn }: AuthGuardProps) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isAuthenticated = isEchoSignedIn || isConnected;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl text-gray-900 tracking-tight dark:text-white">
              Echo Demo App
            </h2>
            <p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
              AI-powered chat with built-in billing and user management
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-gray-300 border-t dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  Or connect with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <WalletConnectButton />
            </div>

            <div className="text-gray-500 text-xs dark:text-gray-400">
              Secure authentication with built-in AI billing
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
