'use client';

import { api } from '@/trpc/client';

import { Skeleton } from '@/components/ui/skeleton';

export const BalanceAmount = () => {
  const [balance] = api.user.balance.get.useSuspenseQuery();
  return <span>{Number(balance.balance).toFixed(2)}</span>;
};

export const LoadingBalanceAmount = () => {
  return <Skeleton className="w-16 h-9" />;
};
