'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';

import { Check, Loader2 } from 'lucide-react';
import { api } from '@/trpc/client';

export const AddCredits = () => {
  const [amount, setAmount] = useState<number>();

  const {
    mutate: createPaymentLink,
    isPending,
    isSuccess,
  } = api.user.payments.createLink.useMutation({
    onSuccess: data => {
      window.location.href = data.paymentLink.url;
    },
  });

  const onAddCredits = () => {
    if (!amount) {
      throw new Error('Amount is required');
    }
    createPaymentLink({ amount });
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <MoneyInput
        setAmount={setAmount}
        placeholder="0.00"
        className="w-full text-right"
        min="1"
        step="0.01"
      />
      <Button
        onClick={onAddCredits}
        disabled={isPending || !amount || amount <= 0 || isSuccess}
        size="lg"
        variant="turbo"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isSuccess ? (
          <Check className="size-4" />
        ) : (
          'Add Credits'
        )}
      </Button>
    </div>
  );
};
