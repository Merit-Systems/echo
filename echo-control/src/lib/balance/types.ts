// Types for Balance feature

export interface BalanceResult {
  balance: number;
  totalPaid: number;
  totalSpent: number;
  currency: string;
  echoAppId: string | null;
  echoAppName: string | null;
}

export interface EnhancedBalanceResult extends BalanceResult {
  usedCreditGrants: boolean; // Indicates if balance was calculated from credit grants
  creditGrantData?: {
    totalCredits: number;
    totalDebits: number;
    activeCredits: number;
    expiredCredits: number;
  };
}
