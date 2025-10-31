'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/client';

export function X402TransactionCostTotal() {
  const { data: totalCost, isLoading } =
    api.admin.wallet.getX402RawTransactionCostTotal.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>X402 Transaction Costs</CardTitle>
        <CardDescription>
          Total raw transaction costs for X402 transactions
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Raw Transaction Cost
          </h3>
          {isLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <div className="text-3xl font-bold text-orange-600">
              ${(totalCost ?? 0).toFixed(6)}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Sum of inference costs from X402 transactions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
