'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/client';
import { toast } from 'sonner';
import { formatDistance } from 'date-fns';

export function EchoX402ProfitTotal() {
  const {
    data: profitData,
    isLoading: isProfitLoading,
    refetch: refetchProfit,
    isFetching: isProfitFetching,
  } = api.admin.wallet.getEchoX402ProfitTotal.useQuery();

  const { data: walletAddress, isLoading: isAddressLoading } =
    api.admin.wallet.getSmartAccountAddress.useQuery();

  const {
    data: usdcBalance,
    isLoading: isUSDCLoading,
    refetch: refetchUSDC,
    isFetching: isUSDCFetching,
  } = api.admin.wallet.getSmartAccountUSDCBalance.useQuery();

  const {
    data: ethBalance,
    isLoading: isETHLoading,
    refetch: refetchETH,
    isFetching: isETHFetching,
  } = api.admin.wallet.getSmartAccountETHBalance.useQuery();

  const {
    data: payoutHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = api.admin.wallet.getEchoPayoutHistory.useQuery();

  const fundRepoMutation = api.admin.wallet.fundEchoRepo.useMutation({
    onSuccess: data => {
      toast.success('Successfully funded repo!', {
        description: `Transaction hash: ${data.userOpHash}`,
      });
      void refetchProfit();
      void refetchUSDC();
      void refetchETH();
      void refetchHistory();
    },
    onError: error => {
      toast.error('Failed to fund repo', {
        description: error.message,
      });
    },
  });

  const isAnyFetching = isProfitFetching || isUSDCFetching || isETHFetching;

  const handleRefresh = () => {
    void refetchProfit();
    void refetchUSDC();
    void refetchETH();
    void refetchHistory();
  };

  const handleFundRepo = () => {
    if (!profitData || profitData <= 0) {
      toast.error('Invalid amount', {
        description: 'Profit total must be greater than 0',
      });
      return;
    }

    fundRepoMutation.mutate({ amount: profitData });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Echo X402 Wallet</CardTitle>
            <div className="flex items-center gap-3">
              {isAnyFetching && (
                <span className="text-sm text-muted-foreground">
                  Refreshing…
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isAnyFetching}
              >
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>Smart Account Wallet Status</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Wallet Address
            </h3>
            {isAddressLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                {walletAddress}
              </code>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Echo Profit
              </h3>
              {isProfitLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-3xl font-bold text-green-600">
                  ${(profitData ?? 0).toFixed(6)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                From X402 transactions
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                USDC Balance
              </h3>
              {isUSDCLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-3xl font-bold text-blue-600">
                  ${(usdcBalance ?? 0).toFixed(6)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">USDC on Base</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                ETH Balance
              </h3>
              {isETHLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-3xl font-bold text-purple-600">
                  {(ethBalance ?? 0).toFixed(6)} ETH
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Native ETH on Base
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            The Echo Profit represents the sum of all echoProfit from X402
            transactions that should be deposited into the Echo repository.
          </p>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full sm:w-auto"
            variant="turbo"
            onClick={handleFundRepo}
            disabled={
              fundRepoMutation.isPending || !profitData || profitData <= 0
            }
          >
            {fundRepoMutation.isPending ? 'Funding...' : 'Fund Repo'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Recent Echo payouts to the Merit repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !payoutHistory || payoutHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No payout history yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map(payout => (
                    <tr key={payout.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {formatDistance(
                          new Date(payout.createdAt),
                          new Date(),
                          { addSuffix: true }
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono">
                        ${Number(payout.amount).toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
