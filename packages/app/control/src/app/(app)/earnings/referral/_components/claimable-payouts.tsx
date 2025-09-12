'use client';

import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/balance';
import { api } from '@/trpc/client';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';
import { toast } from 'sonner';

export const ClaimablePayouts = () => {
  const [earnings] = api.user.payout.referral.get.useSuspenseQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available to Claim</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatCurrency(earnings.total)}
          </div>
          <ClaimAllButton />
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">By App</h3>
          {earnings ? (
            <div className="space-y-2">
              {Object.entries(earnings.byApp).map(([appId, amount]) => {
                const app = earnings.apps?.[appId];
                const displayName = app?.name ?? appId;
                const profileUrl = app?.profilePictureUrl ?? null;
                const fallback = displayName
                  .split(' ')
                  .map(s => s[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={appId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8">
                        {profileUrl ? (
                          <AvatarImage src={profileUrl} alt={displayName} />
                        ) : null}
                        <AvatarFallback>{fallback}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground truncate">
                        {displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(amount)}
                      </span>
                      <ClaimAppButton appId={appId} disabled={amount <= 0} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const ClaimAllButton = () => {
  const utils = api.useUtils();
  const [earnings] = api.user.payout.referral.get.useSuspenseQuery();
  const { mutate: claimAll, isPending } =
    api.user.payout.referral.claimAll.useMutation({
      onSuccess: res => {
        toast.success(
          `Created ${res.payouts.length} referral payout${res.payouts.length === 1 ? '' : 's'}.`
        );
        utils.user.payout.referral.get.invalidate();
        utils.user.payout.referral.pending.invalidate();
      },
      onError: err => {
        toast.error(err.message || 'Failed to claim referral rewards');
      },
    });

  const hasClaimable = useMemo(
    () => earnings && Object.values(earnings.byApp).some(v => v > 0),
    [earnings]
  );

  return (
    <Button disabled={!hasClaimable || isPending} onClick={() => claimAll()}>
      {isPending ? 'Claiming…' : 'Claim All'}
    </Button>
  );
};

const ClaimAppButton = ({
  appId,
  disabled,
}: {
  appId: string;
  disabled?: boolean;
}) => {
  const utils = api.useUtils();
  const claim = api.user.payout.referral.claimForApp.useMutation({
    onSuccess: res => {
      toast.success(
        `Created referral payout for app. Remaining: ${formatCurrency(res.remaining)}`
      );
      utils.user.payout.referral.get.invalidate();
      utils.user.payout.referral.pending.invalidate();
    },
    onError: err => {
      toast.error(err.message || 'Failed to claim referral reward');
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || claim.isPending}
      onClick={() => claim.mutate({ appId })}
    >
      {claim.isPending ? 'Claiming…' : 'Claim'}
    </Button>
  );
};
