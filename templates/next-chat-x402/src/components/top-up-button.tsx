'use client';

import { Button } from '@/components/echo-button';
import { MoneyInput } from '@/components/money-input';
import { type EchoContextValue } from '@merit-systems/echo-react-sdk';
import { Check, CreditCard, Edit, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function EchoTopUpButton({ echo }: { echo: EchoContextValue }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { createPaymentLink } = echo;

  const [amount, setAmount] = useState(10);

  return (
    <div className="flex items-center gap-2 h-11">
      {isEditing ? (
        <>
          <MoneyInput
            setAmount={setAmount}
            initialAmount={amount}
            className="flex-1"
            placeholder="Enter amount"
          />
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={() => setIsEditing(false)}
          >
            <Check className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            className="flex-1"
            size="lg"
            variant="turbo"
            disabled={isLoading || amount <= 0}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (amount <= 0) return;
              setIsLoading(true);
              // Try popup first, fall back to new tab
              const width = 500;
              const height = 700;
              const left = (window.innerWidth - width) / 2;
              const top = (window.innerHeight - height) / 2;
              const popup = window.open(
                'about:blank',
                'payment',
                `width=${width},height=${height},left=${left},top=${top}`
              );

              createPaymentLink(amount)
                .then(url => {
                  // If popup was blocked or we're on mobile, open in new tab
                  if (
                    !popup ||
                    popup.closed ||
                    typeof popup.closed === 'undefined'
                  ) {
                    window.open(url, '_blank');
                  } else {
                    popup.location.href = url;
                  }
                })
                .finally(() => setIsLoading(false));
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Processing...' : `Add ${amount} Credits`}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
