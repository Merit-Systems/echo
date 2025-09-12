'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/client';
import { AdminDataGrid } from './AdminDataGrid';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, DollarSign, TrendingUp, Receipt, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserBreakdownDashboardProps {
  userId: string;
}

interface TransactionData {
  id: string;
  appId: string;
  appName: string;
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
  userBalance: number;
  userBalanceDelta: number;
  createdAt: Date;
}

export function UserBreakdownDashboard({ userId }: UserBreakdownDashboardProps) {
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionPageSize, setTransactionPageSize] = useState(25);
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentPageSize, setPaymentPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp');

  // Fetch user data
  const { data: userEarnings } = api.admin.earnings.getUserEarningsWithCampaigns.useQuery({ userId });
  const { data: userSpending } = api.admin.spending.getUserSpendingEnhanced.useQuery({ userId });
  const { data: userTransactions } = api.admin.transactions.getUserTransactions.useQuery({
    userId,
    page: transactionPage + 1,
    pageSize: transactionPageSize,
  });

  // Fetch user-specific payment data from global payments (filtered by user)
  const { data: paymentsData } = api.admin.paymentsGlobal.getPaginated.useQuery({
    page: paymentPage,
    pageSize: paymentPageSize,
    searchTerm: userEarnings?.userEmail, // Filter by user email
  });
  
  // Transform payment data for the user
  const userPayments: PaymentData[] = useMemo(() => {
    if (!paymentsData?.payments) return [];
    
    return paymentsData.payments
      .filter(payment => payment.userEmail === userEarnings?.userEmail)
      .map(payment => ({
        id: payment.id,
        source: payment.source,
        amount: payment.amount,
        freeTierPoolPaidInto: payment.freeTierDelta,
        freeTierPoolBalance: 0, // Would need additional query for current balance
        freeTierPoolDelta: payment.freeTierDelta,
        userBalance: 0, // Would need additional query for user balance at payment time
        userBalanceDelta: payment.userBalanceDelta,
        createdAt: payment.createdAt,
      }));
  }, [paymentsData, userEarnings?.userEmail]);

  // Transaction column definitions
  const transactionColumnDefs = useMemo<ColDef<TransactionData>[]>(() => [
    {
      headerName: 'App',
      field: 'appName',
      width: 150,
      cellRenderer: ({ data }: { data: TransactionData }) => (
        <Link href={`/admin/apps/${data.appId}`} className="hover:underline text-blue-600">
          {data.appName}
        </Link>
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
      headerName: 'User Balance',
      field: 'userBalance',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ data }: { data: PaymentData }) => (
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

  // Transform transaction data
  const transactionData: TransactionData[] = useMemo(() => {
    if (!userTransactions?.transactions) return [];
    
    return userTransactions.transactions.map((transaction) => ({
      id: String(transaction.id),
      appId: String(transaction.echoApp?.id || 'unknown'),
      appName: (transaction.echoApp as Record<string, unknown>)?.name as string || 'Unknown App',
      totalCost: Number(transaction.totalCost),
      appProfit: Number(transaction.appProfit),
      markUpProfit: Number(transaction.markUpProfit),
      referralProfit: Number(transaction.referralProfit),
      rawModelCost: Number(transaction.rawTransactionCost),
      modelUsed: ((transaction as { transactionMetadata?: { model?: string } }).transactionMetadata?.model) || 'unknown',
      inputTokens: Number(((transaction as { transactionMetadata?: { inputTokens?: number } }).transactionMetadata?.inputTokens) || 0),
      outputTokens: Number(((transaction as { transactionMetadata?: { outputTokens?: number } }).transactionMetadata?.outputTokens) || 0),
      totalTokens: Number(((transaction as { transactionMetadata?: { totalTokens?: number } }).transactionMetadata?.totalTokens) || 0),
      freeTierPoolUsed: transaction.spendPool ? Number(transaction.totalCost) : 0,
      freeTierPoolBalance: 0, // Real balance would require additional query to get spend pool balance at transaction time
      freeTierPoolDelta: transaction.spendPool ? -Number(transaction.totalCost) : 0,
      userUsageInPool: 0, // Would need to calculate
      userUsagePoolDelta: 0,
      userBalance: 0, // Real balance would require additional query to get user balance at transaction time
      userBalanceDelta: transaction.spendPool ? 0 : -Number(transaction.totalCost),
      createdAt: new Date(transaction.createdAt),
    }));
  }, [userTransactions]);

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
            <User className="h-8 w-8" />
            User Breakdown
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed analysis for {userEarnings?.userName || userEarnings?.userEmail || userId}
          </p>
        </div>
      </div>

      {/* High-level Summary */}
      {(userEarnings || userSpending) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>
              High-level breakdown of user&apos;s financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Credits Issued */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Earned</div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(userEarnings?.totalAppProfit || 0)}
                </p>
                <div className="text-xs text-muted-foreground">
                  From {userEarnings?.totalApps || 0} apps
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                <p className="text-2xl font-bold">
                  {formatCurrency(userSpending?.totalSpent || 0)}
                </p>
                <div className="text-xs text-muted-foreground">
                  {userSpending?.totalTransactions || 0} transactions
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Current Balance</div>
                <p className={`text-2xl font-bold ${(userSpending?.currentBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(userSpending?.currentBalance || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Stripe Payments</div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(userSpending?.totalStripePayments || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Free Tier Usage</div>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(userSpending?.freeTierPoolUsage || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Personal Balance Usage</div>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(userSpending?.personalBalanceUsage || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Email Campaigns</div>
                <div className="flex flex-wrap gap-1">
                  {userEarnings?.emailCampaignsReceived.map((campaign) => (
                    <Badge key={campaign} variant="outline" className="text-xs">
                      {campaign}
                    </Badge>
                  )) || <Badge variant="secondary" className="text-xs">None</Badge>}
                </div>
              </div>
            </div>
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
              total: userTransactions?.transactions.length || 0,
              totalPages: Math.ceil((userTransactions?.transactions.length || 0) / transactionPageSize),
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
            data={userPayments}
            columnDefs={paymentColumnDefs}
            loading={!paymentsData}
            error={null}
            pagination={{
              page: paymentPage + 1,
              pageSize: paymentPageSize,
              total: userPayments.length,
              totalPages: Math.ceil(userPayments.length / paymentPageSize),
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
                Email Campaigns Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userEarnings?.emailCampaignsReceived && userEarnings.emailCampaignsReceived.length > 0 ? (
                <div className="grid gap-2">
                  {userEarnings.emailCampaignsReceived.map((campaign) => (
                    <div key={campaign} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{campaign}</div>
                        <div className="text-sm text-muted-foreground">Email campaign</div>
                      </div>
                      <Badge variant="outline">{campaign}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No email campaigns received</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}