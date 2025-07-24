'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Balance } from '@/lib/echo-apps/types';

export function useUserBalance() {
  const { user, isLoaded } = useUser();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<
    'increment' | 'decrement'
  >('increment');

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/balance');
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      setBalance(data);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBalanceAdjustment = useCallback(async () => {
    if (!adjustmentAmount || isNaN(Number(adjustmentAmount))) return;

    try {
      const response = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(adjustmentAmount),
          operation: adjustmentType,
          description: `Manual ${adjustmentType} of $${adjustmentAmount}`,
        }),
      });

      if (response.ok) {
        await fetchBalance();
        setAdjustmentAmount('');
      }
    } catch (error) {
      console.error('Error adjusting balance:', error);
    }
  }, [adjustmentAmount, adjustmentType, fetchBalance]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBalance();
    }
  }, [isLoaded, user, fetchBalance]);

  return {
    balance,
    loading,
    error,
    adjustmentAmount,
    adjustmentType,
    setAdjustmentAmount,
    setAdjustmentType,
    fetchBalance,
    handleBalanceAdjustment,
    refetch: fetchBalance,
  };
}
