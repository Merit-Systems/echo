'use client';

import { EchoAccountButtonPopover } from '@/components/echo-popover';
import { formatCurrency } from '@/lib/currency-utils';
import { Button } from '@/components/echo-button';
import { Logo } from '@/components/logo';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { type EchoContextValue } from '@merit-systems/echo-react-sdk';
import { Gift, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function EchoAccountButton({ echo }: { echo: EchoContextValue }) {
  const { user, balance, freeTierBalance, signIn, isLoading } = echo;
  const [isSigningIn, setIsSigningIn] = useState(false);
  const totalBalance =
    (balance?.balance || 0) + (freeTierBalance?.userSpendInfo.amountLeft || 0);
  const hasFreeCredits = freeTierBalance?.userSpendInfo.amountLeft ?? 0 > 0;
  const buttonContent = isLoading ? (
    <>
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-14" />
    </>
  ) : !user ? (
    <div className="flex items-center gap-2">
      {isSigningIn ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Logo className="size-5" />
      )}
      <span className="text-xs">
        {isSigningIn ? 'Connecting...' : 'Connect'}
      </span>
    </div>
  ) : (
    <>
      <Logo className="size-5" />
      <span>{formatCurrency(totalBalance)}</span>
    </>
  );

  const button = (
    <div className="relative inline-flex">
      <Button
        variant="outline"
        onClick={
          !user
            ? () => {
                setIsSigningIn(true);
                signIn();
              }
            : undefined
        }
        disabled={isLoading || isSigningIn}
        className="w-[108px] px-2.5"
      >
        {buttonContent}
      </Button>
      {hasFreeCredits ? (
        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
          <Gift className="size-3 text-primary-foreground " />
        </div>
      ) : null}
    </div>
  );

  if (!user || isLoading) {
    return button;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <EchoAccountButtonPopover echo={echo} />
    </Popover>
  );
}
