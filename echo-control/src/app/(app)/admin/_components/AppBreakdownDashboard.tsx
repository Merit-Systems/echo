'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/client';
import { AdminDataGrid } from './AdminDataGrid';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Smartphone, DollarSign, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppBreakdownDashboardProps {
  appId: string;
}

interface TransactionData {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  rawModelCost: number;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  freeTierPoolUsed: number;
  freeTierPoolBalance: number;
  freeTierPoolDelta: number;
  userUsageInPool: number;
  userUsagePoolDelta: number;
  userBalance: number;
  userBalanceDelta: number;
  createdAt: Date;
}

interface PaymentData {
  id: string;
  source: string;
  amount: number;
  freeTierPoolPaidInto: number;
  freeTierPoolBalance: number;
  freeTierPoolDelta: number;
  createdAt: Date;
}

export function AppBreakdownDashboard({ appId }: AppBreakdownDashboardProps) {
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionPageSize, setTransactionPageSize] = useState(25);

  // Fetch app data
  const { data: appEarnings } = api.admin.earnings.getAppEarningsAcrossAllUsers.useQuery({ appId });
  const { data: _appSpending } = api.admin.spending.getAppSpendingAcrossAllUsers.useQuery({ appId });
  const { data: appTransactions } = api.admin.transactions.getAppTransactions.useQuery({
    appId,
    page: transactionPage + 1,
    pageSize: transactionPageSize,
  });
  const { data: appTotals } = api.admin.transactions.getAppTransactionTotals.useQuery({ appId });

  // Fetch email campaigns data for this app
  const { data: appCampaigns } = api.admin.emailCampaigns.getSentForApps.useQuery({
    appIds: [appId],
  });

  // Transaction column definitions
  const transactionColumnDefs = useMemo<ColDef<TransactionData>[]>(() => [
    {
      headerName: 'User',
      field: 'userName',
      width: 200,
      cellRenderer: ({ data }: { data: TransactionData }) => (
        <div className="flex flex-col">
          <Link href={`/admin/users/${data.userId}`} className="font-medium hover:underline text-blue-600">
            {data.userName || 'No name'}
          </Link>
          <span className="text-sm text-muted-foreground">{data.userEmail}</span>
        </div>
      ),
    },
    {
      headerName: 'Total Revenue',
      field: 'totalCost',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatCurrency(value),
    },
    {
      headerName: 'App Profit',
      field: 'appProfit',
      width: 110,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-green-600">{formatCurrency(value)}</span>
      ),
    },
    {
      headerName: 'Markup Profit',
      field: 'markUpProfit',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-blue-600">{formatCurrency(value)}</span>
      ),
    },
    {
      headerName: 'Referral Profit',
      field: 'referralProfit',
      width: 130,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-purple-600">{formatCurrency(value)}</span>
      ),
    },
    {
      headerName: 'Model Cost',
      field: 'rawModelCost',
      width: 110,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatCurrency(value),
    },
    {
      headerName: 'Model',
      field: 'modelUsed',
      width: 120,
      cellRenderer: ({ value }: { value: string }) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      headerName: 'Tokens',
      field: 'totalTokens',
      width: 100,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatNumber(value),
    },
    {
      headerName: 'Free Tier Usage',
      field: 'freeTierPoolUsed',
      width: 130,
      type: 'numericColumn',
      cellRenderer: ({ data }: { data: TransactionData }) => (
        <div className="text-xs">
          <div className="text-blue-600">{formatCurrency(data.freeTierPoolUsed)}</div>
          <div className="text-muted-foreground">
            Δ{data.freeTierPoolDelta > 0 ? '+' : ''}{formatCurrency(data.freeTierPoolDelta)}
          </div>
        </div>
      ),
    },
    {
      headerName: 'Balance Usage',
      field: 'userBalance',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ data }: { data: TransactionData }) => (
        <div className="text-xs">
          <div className="text-purple-600">{formatCurrency(data.userBalance)}</div>
          <div className="text-muted-foreground">
            Δ{data.userBalanceDelta > 0 ? '+' : ''}{formatCurrency(data.userBalanceDelta)}
          </div>
        </div>
      ),
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      width: 110,
      cellRenderer: ({ value }: { value: Date }) => (
        <span className="text-xs">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ], []);

  // Payment column definitions
  const paymentColumnDefs = useMemo<ColDef<PaymentData>[]>(() => [
    {
      headerName: 'Source',
      field: 'source',
      width: 100,
      cellRenderer: ({ value }: { value: string }) => (
        <Badge className={value === 'stripe' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
          {value}
        </Badge>
      ),
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 100,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-green-600 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      headerName: 'Free Tier Pool',
      field: 'freeTierPoolBalance',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ data }: { data: PaymentData }) => (
        <div className="text-xs">
          <div className="text-blue-600">{formatCurrency(data.freeTierPoolBalance)}</div>
          <div className="text-muted-foreground">
            Δ{data.freeTierPoolDelta > 0 ? '+' : ''}{formatCurrency(data.freeTierPoolDelta)}
          </div>
        </div>
      ),
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      width: 110,
      cellRenderer: ({ value }: { value: Date }) => (
        <span className="text-xs">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ], []);

  // Transform transaction data
  const transactionData: TransactionData[] = useMemo(() => {
    if (!appTransactions?.transactions) return [];
    
    return appTransactions.transactions.map((transaction) => ({
      id: String(transaction.id),
      userId: String(transaction.user?.id || 'unknown'),
      userName: transaction.user?.name || null,
      userEmail: transaction.user?.email || 'unknown@example.com',
      totalCost: Number(transaction.totalCost),
      appProfit: Number(transaction.appProfit),
      markUpProfit: Number(transaction.markUpProfit),
      referralProfit: Number(transaction.referralProfit),
      rawModelCost: Number(transaction.rawTransactionCost),
      modelUsed: (transaction as { transactionMetadata?: { model?: string; inputTokens?: number; outputTokens?: number; totalTokens?: number } }).transactionMetadata?.model || 'unknown',
      inputTokens: Number((transaction as { transactionMetadata?: { inputTokens?: number } }).transactionMetadata?.inputTokens || 0),
      outputTokens: Number((transaction as { transactionMetadata?: { outputTokens?: number } }).transactionMetadata?.outputTokens || 0),
      totalTokens: Number((transaction as { transactionMetadata?: { totalTokens?: number } }).transactionMetadata?.totalTokens || 0),
      freeTierPoolUsed: transaction.spendPool ? Number(transaction.totalCost) : 0,
      freeTierPoolBalance: 0, // Real balance would require additional query to get current spend pool balance
      freeTierPoolDelta: transaction.spendPool ? -Number(transaction.totalCost) : 0,
      userUsageInPool: 0, // Would need to calculate
      userUsagePoolDelta: 0,
      userBalance: 0, // Real balance would require additional query to get user balance at transaction time
      userBalanceDelta: transaction.spendPool ? 0 : -Number(transaction.totalCost),
      createdAt: new Date(transaction.createdAt),
    }));
  }, [appTransactions]);

  // Fetch payment data for users who have used this app
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentPageSize, setPaymentPageSize] = useState(25);
  
  // Note: Currently showing all payments globally. Ideally this would be filtered to only
  // users who have used this specific app, but that requires additional backend logic
  const { data: paymentsData } = api.admin.paymentsGlobal.getPaginated.useQuery({
    page: paymentPage,
    pageSize: paymentPageSize,
  });

  // Calculate popular models
  const popularModels = useMemo(() => {
    const modelCounts = transactionData.reduce((acc, transaction) => {
      acc[transaction.modelUsed] = (acc[transaction.modelUsed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([model, count]) => ({ model, count }));
  }, [transactionData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="h-8 w-8" />
            App Breakdown
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed analysis for {appEarnings?.appAggregates.appName || appId}
          </p>
        </div>
      </div>

      {/* High-level Summary */}
      {(appEarnings || appTotals) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              App Financial Summary
            </CardTitle>
            <CardDescription>
              High-level breakdown of app&apos;s financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                <p className="text-2xl font-bold">
                  {formatCurrency(appEarnings?.appAggregates.totalCost || 0)}
                </p>
                <div className="text-xs text-muted-foreground">
                  Free: {formatCurrency(0)} | Personal: {formatCurrency(appEarnings?.appAggregates.totalCost || 0)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Earned</div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(appEarnings?.appAggregates.appProfit || 0)}
                </p>
                <div className="text-xs text-muted-foreground">
                  From {appEarnings?.userCount || 0} users
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(appEarnings?.userCount || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Transactions</div>
                <p className="text-2xl font-bold">
                  {formatNumber(appEarnings?.appAggregates.transactionCount || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Referral Profit</div>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(appEarnings?.appAggregates.referralProfit || 0)}
                </p>
                <div className="text-xs text-muted-foreground">Claimed: $0</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Markup Profit</div>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(appEarnings?.appAggregates.markUpProfit || 0)}
                </p>
                <div className="text-xs text-muted-foreground">Claimed: $0</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Tokens</div>
                <p className="text-lg font-bold">
                  {formatNumber(appEarnings?.appAggregates.totalTokens || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Owner</div>
                {appEarnings?.ownerInfo ? (
                  <Link href={`/admin/users/${appEarnings.ownerInfo.userId}`} className="text-blue-600 hover:underline">
                    <div className="font-medium">{appEarnings.ownerInfo.userName || 'No name'}</div>
                    <div className="text-xs text-muted-foreground">{appEarnings.ownerInfo.userEmail}</div>
                  </Link>
                ) : (
                  <div className="text-muted-foreground">No owner</div>
                )}
              </div>
            </div>

            {/* Popular Models */}
            {popularModels.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-3">Most Popular Models</div>
                <div className="flex flex-wrap gap-2">
                  {popularModels.map(({ model, count }) => (
                    <Badge key={model} variant="outline">
                      {model} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Tables */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <AdminDataGrid<TransactionData>
            title="Transaction History"
            data={transactionData}
            columnDefs={transactionColumnDefs}
            loading={false}
            error={null}
            pagination={{
              page: transactionPage + 1,
              pageSize: transactionPageSize,
              total: appTransactions?.transactions.length || 0,
              totalPages: Math.ceil((appTransactions?.transactions.length || 0) / transactionPageSize),
              onPageChange: (newPage: number) => setTransactionPage(newPage - 1),
              onPageSizeChange: (newPageSize: number) => {
                setTransactionPageSize(newPageSize);
                setTransactionPage(0);
              },
            }}
            className="min-h-[600px]"
          />
        </TabsContent>

        <TabsContent value="payments">
          <AdminDataGrid<PaymentData>
            title="Payment History"
            data={paymentsData?.payments.map(payment => ({
              id: payment.id,
              source: payment.source,
              amount: payment.amount,
              freeTierPoolPaidInto: payment.freeTierDelta,
              freeTierPoolBalance: 0, // Would need additional query for current balance
              freeTierPoolDelta: payment.freeTierDelta,
              createdAt: payment.createdAt,
            })) || []}
            columnDefs={paymentColumnDefs}
            loading={!paymentsData}
            error={null}
            pagination={{
              page: paymentPage + 1,
              pageSize: paymentPageSize,
              total: paymentsData?.pagination.total || 0,
              totalPages: paymentsData?.pagination.totalPages || 0,
              onPageChange: (newPage: number) => setPaymentPage(newPage - 1),
              onPageSizeChange: (newPageSize: number) => {
                setPaymentPageSize(newPageSize);
                setPaymentPage(0);
              },
            }}
            className="min-h-[400px]"
          />
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
              <CardDescription>
                Email campaigns sent about this app and to the app owner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appCampaigns && appCampaigns[appId]?.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">App Campaigns</h3>
                    <div className="grid gap-2">
                      {appCampaigns[appId].map((campaignKey) => (
                        <div key={campaignKey} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{campaignKey}</div>
                            <div className="text-sm text-muted-foreground">
                              Campaign sent to this app
                            </div>
                          </div>
                          <Badge variant="outline">{campaignKey}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Owner Campaigns</h3>
                    {appEarnings?.ownerInfo ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Owner campaign data would require separate query for user {appEarnings.ownerInfo.userId}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No owner found</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No email campaigns found for this app</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}