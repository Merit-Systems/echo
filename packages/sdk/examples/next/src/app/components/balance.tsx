'use client';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { useEffect, useState } from 'react';
import { PaymentLink } from './payment-link';

export const Balance = () => {
  const echoClient = useEcho();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    echoClient.balance
      .getBalance()
      .then(balance => setBalance(balance.balance))
      .catch(error => {
        console.error('Error fetching balance:', error);
      });
  }, [echoClient]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50">
      <div className="text-lg font-semibold">
        Client hook balance: $
        {balance !== null ? balance.toFixed(2) : 'Loading...'}
      </div>
      <PaymentLink amount={10} description="Credits" />
    </div>
  );
};
