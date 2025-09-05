'use client';

import { useMemo } from 'react';

import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/balance';
import { toast } from 'sonner';
import { Github } from 'lucide-react';
import { GithubAvatar } from '@/components/ui/github-avatar';
import { githubApi } from '@/lib/github-api';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

export default function MarkupEarningsPage() {
  const utils = api.useUtils();
  const {
    data: earnings,
    isLoading: earningsLoading,
    error: earningsError,
    refetch,
  } = api.user.payout.markup.get.useQuery();

  const claimAll = api.user.payout.markup.claimAll.useMutation({
    onSuccess: res => {
      toast.success(
        `Created ${res.payouts.length} markup payout${res.payouts.length === 1 ? '' : 's'}.`
      );
      utils.user.payout.markup.get.invalidate();
      utils.user.payout.markup.pending.invalidate();
    },
    onError: err => {
      toast.error(err.message || 'Failed to claim markup rewards');
    },
  });

  const {
    data: pending,
    isLoading: pendingLoading,
    error: pendingError,
  } = api.user.payout.markup.pending.useQuery();

  const hasClaimable = useMemo(
    () => earnings && Object.values(earnings.byApp).some(v => v > 0),
    [earnings]
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Markup Earnings</h1>
        <p className="text-muted-foreground">
          View and claim your app markup earnings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available to Claim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {earningsError ? (
            <div className="text-sm text-red-500">{earningsError.message}</div>
          ) : earningsLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : earnings ? (
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(earnings.total)}
              </div>
              <Button
                disabled={!hasClaimable || claimAll.isPending}
                onClick={() => claimAll.mutate()}
              >
                {claimAll.isPending ? 'Claiming…' : 'Claim All'}
              </Button>
            </div>
          ) : null}

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">By App</h3>
            {earningsError ? (
              <div className="text-sm text-red-500">
                {earningsError.message}
              </div>
            ) : earningsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : earnings ? (
              <div className="space-y-2">
                {Object.entries(earnings.byApp).map(([appId, amount]) => {
                  const meta = earnings.appMeta?.[appId];
                  const appName = meta?.name || 'Unnamed App';
                  const avatarUrl = meta?.profilePictureUrl || null;
                  const githubLink = meta?.githubLink || null;
                  const githubUrl = githubLink?.githubUrl || null;

                  return (
                    <div
                      key={appId}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ProfileAvatar
                          name={appName}
                          src={avatarUrl}
                          size="sm"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {appName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {appId}
                          </span>
                        </div>
                        <div className="ml-3 mb-2 flex items-center justify-center">
                          <GithubAvatar
                            pageUrl={githubUrl || undefined}
                            className="size-6"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {formatCurrency(amount)}
                        </span>
                        <ClaimButton
                          appId={appId}
                          disabled={amount <= 0}
                          onClaim={async () => {
                            await refetch();
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingError ? (
            <div className="text-sm text-red-500">{pendingError.message}</div>
          ) : pendingLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : pending && pending.length > 0 ? (
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
    </div>
  );
}

function ClaimButton({
  appId,
  disabled,
  onClaim,
}: {
  appId: string;
  disabled?: boolean;
  onClaim: () => void | Promise<void>;
}) {
  const utils = api.useUtils();
  const claim = api.user.payout.markup.claimForApp.useMutation({
    onSuccess: res => {
      toast.success(
        `Created markup payout for app. Remaining: ${formatCurrency(res.remaining)}`
      );
      utils.user.payout.markup.get.invalidate();
      utils.user.payout.markup.pending.invalidate();
      onClaim();
    },
    onError: err => {
      toast.error(err.message || 'Failed to claim markup reward');
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
}
