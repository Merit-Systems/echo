import { useState } from 'react';

import { Check, Loader2, Pencil } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MoneyInput } from '@/components/ui/money-input';

import { formatCurrency } from '@/lib/utils';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
  spendLimit: number | undefined | null;
}

export const SpendLimit: React.FC<Props> = ({ appId, spendLimit }) => {
  return (
    <div className="flex items-center gap-2">
      {spendLimit === null ? (
        <h3 className="text-2xl font-bold text-foreground/60">No Free Tier</h3>
      ) : spendLimit === undefined ? (
        <h3 className="text-2xl font-bold text-foreground/60">
          No Spend Limit
        </h3>
      ) : (
        <h3 className="text-2xl font-bold text-foreground/80">
          {formatCurrency(spendLimit)}
        </h3>
      )}
      {spendLimit !== null && (
        <SpendLimitDialog appId={appId} spendLimit={spendLimit}>
          <Button
            variant="ghost"
            size="icon"
            className="size-fit md:size-fit p-1.5 mt-1"
          >
            <Pencil className="size-3.5" />
          </Button>
        </SpendLimitDialog>
      )}
    </div>
  );
};

interface SpendLimitDialogProps {
  appId: string;
  spendLimit: number | undefined;
  children: React.ReactNode;
}

const SpendLimitDialog: React.FC<SpendLimitDialogProps> = ({
  appId,
  spendLimit,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(spendLimit ?? 0);

  const utils = api.useUtils();

  const {
    mutate: updateSpendLimit,
    isPending,
    isSuccess,
  } = api.apps.app.freeTier.update.useMutation({
    onSuccess: () => {
      toast.success('Per user spend limit updated');
      void utils.apps.app.freeTier.get.invalidate();
      setIsOpen(false);
    },
    onError: () => {
      toast.error('Failed to update per user spend limit');
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Spend Limit</DialogTitle>
          <DialogDescription>
            Each user will be able to spend up to this amount of credits for
            free before they have to buy credits and spend their Echo balance.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <MoneyInput
            setAmount={setAmount}
            initialAmount={spendLimit}
            placeholder="0.00"
          />
        </div>
        <DialogFooter>
          <Button
            variant="turbo"
            onClick={() =>
              updateSpendLimit({ appId, perUserSpendLimit: amount })
            }
            className="w-full"
            disabled={
              amount === 0 || amount === spendLimit || isPending || isSuccess
            }
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSuccess ? (
              <Check className="size-4" />
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
