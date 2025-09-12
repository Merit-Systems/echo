'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/balance';

import { api } from '@/trpc/client';

export const PendingPayouts = () => {
  const [earnings] = api.user.payout.referral.get.useSuspenseQuery();
  const [pending] = api.user.payout.referral.pending.useSuspenseQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.length > 0 ? (
          pending.map(p => {
            const app = p.echoAppId ? earnings?.apps?.[p.echoAppId] : undefined;
            const displayName = app?.name ?? p.echoAppId ?? 'Unknown app';
            const profileUrl = app?.profilePictureUrl ?? null;
            const fallback = displayName
              .split(' ')
              .map(s => s[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-6 w-6">
                    {profileUrl ? (
                      <AvatarImage src={profileUrl} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="text-[10px]">
                      {fallback}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate">
                    {displayName}
                  </span>
                </div>
                <span className="font-medium">
                  {formatCurrency(Number(p.amount))}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground">
            No pending payouts
          </div>
        )}
      </CardContent>
    </Card>
  );
};
