'use client';

import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount, useConnectorClient, useWalletClient } from 'wagmi';
import { wrapFetchWithPayment } from 'x402-fetch';

export function PayButton() {
  const [shouldFetch, setShouldFetch] = useState(false);

  const account = useAccount();

  const { data: client } = useWalletClient();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['x402-payment'],
    queryFn: async () => {
      const _fetch = wrapFetchWithPayment(fetch, client);
      const response = await _fetch('/api/x402');
      return response.json();
    },
    retry: false,
    enabled: shouldFetch,
  });

  const handlePayment = () => {
    setShouldFetch(true);
    refetch();
  };

  console.log('data:', data);
  console.log('error:', error);
  const result = error
    ? JSON.stringify(error, null, 2)
    : data
      ? JSON.stringify(data, null, 2)
      : '';

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="space-y-4 text-center">
        <div className="text-sm text-gray-500">{account.address}</div>
        <Button onClick={handlePayment} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Pay'}
        </Button>
        {result && (
          <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto text-center">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
