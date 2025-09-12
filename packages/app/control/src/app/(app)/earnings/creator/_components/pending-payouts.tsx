'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/balance';

import { api } from '@/trpc/client';

export const PendingPayouts = () => {
  const [pending] = api.user.payout.markup.pending.useSuspenseQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending && pending.length > 0 ? (
          pending.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{p.echoAppId}</span>
              <span className="font-medium">
                {formatCurrency(Number(p.amount))}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            No pending payouts
          </div>
        )}
      </CardContent>
    </Card>
  );
};
