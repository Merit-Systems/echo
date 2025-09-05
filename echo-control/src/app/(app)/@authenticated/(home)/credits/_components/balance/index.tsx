import { Suspense } from 'react';

import { Plus, Gift } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { AddCredits } from './add-credits';
import { RedeemCredits } from './redeem-credits';
import { BalanceAmount, LoadingBalanceAmount } from './amount';

const BalanceContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="border rounded-lg overflow-hidden flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </Card>
  );
};

const BalanceAmountContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <h2 className="flex items-center gap-4 text-3xl font-bold">
      <span className="text-muted-foreground">$</span>
      {children}
    </h2>
  );
};

export const Balance = () => {
  return (
    <BalanceContainer>
      <BalanceAmountContainer>
        <Suspense fallback={<LoadingBalanceAmount />}>
          <BalanceAmount />
        </Suspense>
      </BalanceAmountContainer>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="turbo" className="w-full sm:w-auto">
              <Plus className="size-4" />
              Buy Credits
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credits</DialogTitle>
              <DialogDescription>
                You can use Echo credits to use LLMs on any Echo app.
              </DialogDescription>
            </DialogHeader>
            <AddCredits />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Gift className="size-4" />
              Redeem Code
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redeem Credit Code</DialogTitle>
              <DialogDescription>
                You can use Echo credits to use LLMs on any Echo app.
              </DialogDescription>
            </DialogHeader>
            <RedeemCredits />
          </DialogContent>
        </Dialog>
      </div>
    </BalanceContainer>
  );
};

export const LoadingBalance = () => {
  return (
    <BalanceContainer>
      <BalanceAmountContainer>
        <LoadingBalanceAmount />
      </BalanceAmountContainer>
    </BalanceContainer>
  );
};
