export interface Balance {
  totalPaid: number;
  totalSpent: number;
  balance: number;
  currency: string;
}

export interface AppBalance extends Balance {
  echoAppId: string;
  echoAppName: string;
}
