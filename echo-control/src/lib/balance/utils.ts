import { Balance } from '@/lib/types/apps';
import { BalanceResult } from '.';

export function formatBalanceResult(balanceResult: BalanceResult): Balance {
  return {
    balance: balanceResult.balance.toString(),
    totalPaid: balanceResult.totalPaid.toString(),
    totalSpent: balanceResult.totalSpent.toString(),
    currency: balanceResult.currency,
  };
}
