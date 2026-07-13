"use client";

import Chat from '@/app/_components/chat';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEcho } from '@merit-systems/echo-react-sdk';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isLoggedIn, isLoading } = useEcho();
  const { isConnected, isConnecting } = useAccount();

  if (isLoading || isConnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <Skeleton className="mx-auto mt-6 h-9 w-64" />
            <Skeleton className="mx-auto mt-2 h-4 w-80" />
          </div>

          <div className="space-y-4">
            <Skeleton className="mx-auto h-[44px] w-full rounded-lg" />
            <Skeleton className="mx-auto h-3 w-56" />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br p-4 dark:from-gray-900 dark:to-gray-800">
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

            <div className="text-gray-500 text-xs dark:text-gray-400">
              Secure authentication with built-in AI billing
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Chat />;
}
