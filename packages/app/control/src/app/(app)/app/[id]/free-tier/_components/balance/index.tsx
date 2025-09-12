'use client';

import { Suspense } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { AddCredits } from './add-credits';

import { api } from '@/trpc/client';

import { formatCurrency } from '@/lib/utils';

interface Props {
  appId: string;
}

const BalanceContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="border rounded-lg overflow-hidden flex flex-col gap-2 p-4">
      <h1 className="text-lg font-semibold text-muted-foreground">Balance</h1>
      <div className="flex items-center gap-4 w-full">{children}</div>
    </Card>
  );
};

export const Balance: React.FC<Props> = ({ appId }) => {
  return (
    <BalanceContainer>
      <Suspense fallback={<BalanceAmountSkeleton />}>
        <h2 className="flex items-center gap-4 text-3xl font-bold">
          <BalanceAmount appId={appId} />
        </h2>
      </Suspense>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="turbo" size="sm">
            <Plus className="size-3.5" />
            Add Credits
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Free Tier Credits</DialogTitle>
            <DialogDescription>
              Your users will be able to use free tier credits before they have
              to buy credits and spend their Echo balance.
            </DialogDescription>
          </DialogHeader>
          <AddCredits appId={appId} />
        </DialogContent>
      </Dialog>
    </BalanceContainer>
  );
};

export const LoadingBalance = () => {
  return (
    <BalanceContainer>
      <BalanceAmountSkeleton />
    </BalanceContainer>
  );
};

const BalanceAmount = ({ appId }: Props) => {
  const [freeTier] = api.apps.app.freeTier.get.useSuspenseQuery({
    appId,
  });

  return (
    <span>
      {freeTier ? (
        <span>{formatCurrency(freeTier.balance)}</span>
      ) : (
        <span>{formatCurrency(0)}</span>
      )}
    </span>
  );
};

const BalanceAmountSkeleton = () => {
  return <Skeleton className="w-24 h-9" />;
};
