'use client';

import {
  CreditCardIcon,
  PlusIcon,
  MinusIcon,
  ArrowUpRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassButton } from './glass-button';
import { formatCurrency } from '@/lib/balance';
import { Logo } from './ui/logo';
import { useUserBalance } from '@/hooks/useUserBalance';

interface BalanceCardProps {
  compact?: boolean;
}

export default function BalanceCard({ compact = false }: BalanceCardProps) {
  const router = useRouter();
  const {
    balance,
    loading,
    adjustmentAmount,
    adjustmentType,
    setAdjustmentAmount,
    setAdjustmentType,
    handleBalanceAdjustment,
  } = useUserBalance();

  const handleNavigateToCredits = () => {
    router.push('/credits');
  };

  if (loading) {
    if (compact) {
      return (
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="h-6 w-6 bg-muted rounded"></div>
          <div className="h-5 w-24 bg-muted rounded"></div>
        </div>
      );
    }

    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={handleNavigateToCredits}
        className="flex items-center space-x-2 px-3 py-2.5 rounded-lg bg-background border border-border hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 shadow-sm group h-10"
        title="View and manage credits"
      >
        <Logo className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
        <span className="text-sm font-extrabold text-foreground">
          {formatCurrency(Number(balance?.balance) || 0)}
        </span>
        <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-secondary transition-colors" />
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <CreditCardIcon className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Credits Balance</h3>
            <p className="text-sm text-muted-foreground">
              Available spending credits
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(Number(balance.balance))}
          </div>
          <div className="text-xs text-muted-foreground">
            {balance.currency.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Balance Adjustment Section */}
      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-foreground">
            Adjust Balance
          </h4>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={adjustmentType}
            onChange={e =>
              setAdjustmentType(e.target.value as 'increment' | 'decrement')
            }
            className="px-3 py-2 border border-input bg-background text-foreground rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          >
            <option value="increment">Add</option>
            <option value="decrement">Subtract</option>
          </select>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={adjustmentAmount}
              onChange={e => setAdjustmentAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-input bg-background text-foreground rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              placeholder="0.00"
            />
          </div>

          <GlassButton
            onClick={handleBalanceAdjustment}
            disabled={!adjustmentAmount || isNaN(Number(adjustmentAmount))}
            variant="secondary"
          >
            {adjustmentType === 'increment' ? (
              <PlusIcon className="h-4 w-4" />
            ) : (
              <MinusIcon className="h-4 w-4" />
            )}
          </GlassButton>
        </div>
      </div>

      {/* Purchase Credits Section */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-foreground">
            Purchase Credits
          </h4>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <GlassButton
          onClick={handleNavigateToCredits}
          variant="primary"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Logo className="h-4 w-4" />
          <span>Buy Credits</span>
          <ArrowUpRight className="h-4 w-4" />
        </GlassButton>
      </div>
    </div>
  );
}
