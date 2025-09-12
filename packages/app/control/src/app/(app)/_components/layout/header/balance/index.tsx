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
    return null;
  }

  void api.user.balance.get.prefetch();

  return (
    <HydrateClient>
      <Link href="/credits">
        <Button variant="outline">
          <Suspense fallback={<Skeleton className="h-5 w-10" />}>
            <Balance />
          </Suspense>
        </Button>
      </Link>
    </HydrateClient>
  );
};
