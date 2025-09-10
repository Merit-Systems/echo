'use client';

import { useMemo } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinimalGithubAvatar } from '@/components/ui/github-avatar';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

import { api } from '@/trpc/client';

import { formatCurrency } from '@/lib/balance';

export const ClaimablePayouts = () => {
  const [earnings] = api.user.payout.markup.get.useSuspenseQuery();

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
                const meta = earnings.appMeta?.[appId];
                const appName = meta?.name || 'Unnamed App';
                const avatarUrl = meta?.profilePictureUrl ?? null;
                const githubLink = meta?.githubLink ?? null;
                const githubUrl = githubLink?.githubUrl ?? null;

                return (
                  <div
                    key={appId}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProfileAvatar name={appName} src={avatarUrl} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{appName}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {appId}
                        </span>
                      </div>
                      <div className="ml-3 mb-2 flex items-center justify-center">
                        <MinimalGithubAvatar
                          login={
                            githubUrl
                              ? githubUrl
                                  .replace(/^https?:\/\/github\.com\//, '')
                                  .split('/')[0]
                              : undefined
                          }
                          className="size-6"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
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
  const [earnings] = api.user.payout.markup.get.useSuspenseQuery();
  const { mutate: claimAll, isPending } =
    api.user.payout.markup.claimAll.useMutation({
      onSuccess: res => {
        toast.success(
          `Created ${res.payouts.length} markup payout${res.payouts.length === 1 ? '' : 's'}.`
        );
        void utils.user.payout.markup.get.invalidate();
        void utils.user.payout.markup.pending.invalidate();
      },
      onError: err => {
        toast.error(err.message || 'Failed to claim markup rewards');
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
  const claim = api.user.payout.markup.claimForApp.useMutation({
    onSuccess: res => {
      toast.success(
        `Created markup payout for app. Remaining: ${formatCurrency(res.remaining)}`
      );
      void utils.user.payout.markup.get.invalidate();
      void utils.user.payout.markup.pending.invalidate();
    },
    onError: err => {
      toast.error(err.message || 'Failed to claim markup reward');
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled ?? claim.isPending}
      onClick={() => claim.mutate({ appId })}
    >
      {claim.isPending ? 'Claiming…' : 'Claim'}
    </Button>
  );
};
