'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectionSelector } from './connection-selector';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isConnected } = useAccount();
  const { user } = useEcho();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isEchoSignedIn = !!user;
  const isAuthenticated = isEchoSignedIn || isConnected;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl text-gray-900 tracking-tight dark:text-white">
              Echo Chat
            </h2>
            <p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
              Sign in to start chatting
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <ConnectionSelector />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
