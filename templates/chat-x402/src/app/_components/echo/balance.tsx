'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BalanceData {
  balance: number;
  currency?: string;
}

export default function Balance() {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { balance, echoClient } = useEcho();

  useEffect(() => {
    if (balance) {
      setBalanceData({ balance: balance.balance || 0, currency: 'USD' });
      setLoading(false);
    }
  }, [balance]);

  const formatBalance = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Button variant="outline">
      {loading && (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
      )}

      {error && <span className="text-red-600 text-xs">Error</span>}

      {balanceData && !loading && !error && (
        <span className="px-3 py-2 font-medium text-gray-700 text-sm hover:text-gray-900">
          {formatBalance(balanceData.balance, balanceData.currency)}
        </span>
      )}
    </Button>
  );
}
