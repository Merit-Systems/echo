export interface UserSpendInfo {
  userId: string;
  echoAppId: string;
  spendPoolId: string | null;
  amountSpent: number;
  spendLimit: number | null;
  amountLeft: number;
}
