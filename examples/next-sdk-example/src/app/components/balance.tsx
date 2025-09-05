'use client';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { useEffect, useState } from 'react';

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

  return <div>Client hook balance: {balance}</div>;
};
