import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { Suspense } from 'react';

import { Balance } from './balance-display';
import { api, HydrateClient } from '@/trpc/server';
import { auth } from '@/auth';

export const BalanceButton = async () => {
  const session = await auth();

  if (!session?.user) {
    return <BalanceSkeleton />;
  }

  return <BalanceButtonContent />;
};

const BalanceButtonContent = () => {
  void api.user.balance.get.prefetch();
  return (
    <HydrateClient>
      <Button variant="outline" asChild>
        <Link href="/credits">
          <Suspense fallback={<BalanceSkeleton />}>
            <Balance />
          </Suspense>
        </Link>
      </Button>
    </HydrateClient>
  );
};

const BalanceSkeleton = () => {
  return <Skeleton className="h-5 w-10" />;
};
