'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/client';
import { AdminDataGrid } from './AdminDataGrid';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentData {
  id: string;
  source: string;
  amount: number;
  userId: string;
  userName: string | null;
  userEmail: string;
  freeTierDelta: number;
  userBalanceDelta: number;
  createdAt: Date;
}

export function PaymentsGlobalGrid() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch data
  const { data, isLoading, error, refetch } = api.admin.paymentsGlobal.getPaginated.useQuery({
    page,
    pageSize,
    searchTerm: searchTerm || undefined,
    sortField,
    sortDirection,
  });

  // Column definitions for AG-Grid
  const columnDefs = useMemo<ColDef<PaymentData>[]>(() => [
    {
      headerName: 'Payment ID',
      field: 'id',
      width: 150,
      cellRenderer: ({ value }: { value: string }) => (
        <span className="font-mono text-sm">
          {value.substring(0, 8)}...
        </span>
      ),
    },
    {
      headerName: 'Source',
      field: 'source',
      width: 120,
      cellRenderer: ({ value }: { value: string }) => {
        const colors: Record<string, string> = {
          stripe: 'bg-green-100 text-green-800',
          admin: 'bg-blue-100 text-blue-800',
          signup_gift: 'bg-purple-100 text-purple-800',
        };
        return (
          <Badge className={colors[value] || 'bg-gray-100 text-gray-800'}>
            {value.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      headerName: 'User',
      field: 'userName',
      minWidth: 200,
      flex: 1,
      cellRenderer: ({ data }: { data: PaymentData }) => (
        <div className="flex flex-col">
          <Link href={`/admin/users/${data.userId}`} className="font-medium hover:underline text-blue-600">
            {data.userName || 'No name'}
          </Link>
          <span className="text-sm text-muted-foreground">{data.userEmail}</span>
        </div>
      ),
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="font-medium text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Free Tier Δ',
      field: 'freeTierDelta',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="font-medium text-blue-600">
          {value > 0 ? '+' : ''}{formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'User Balance Δ',
      field: 'userBalanceDelta',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="font-medium text-purple-600">
          {value > 0 ? '+' : ''}{formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      width: 150,
      cellRenderer: ({ value }: { value: Date }) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      headerName: 'Actions',
      field: 'userId',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: PaymentData }) => (
        <Link href={`/admin/users/${data.userId}`}>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ], []);

  // Handle pagination
  const pagination = useMemo(() => {
    if (!data) return undefined;

    return {
      page: data.pagination.page + 1,
      pageSize: data.pagination.pageSize,
      total: data.pagination.total,
      totalPages: data.pagination.totalPages,
      onPageChange: (newPage: number) => setPage(newPage - 1),
      onPageSizeChange: (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(0);
      },
    };
  }, [data]);

  // Handle global search
  const globalSearch = useMemo(() => ({
    value: searchTerm,
    onChange: (value: string) => {
      setSearchTerm(value);
      setPage(0);
    },
    placeholder: 'Search payments, users, or sources...',
  }), [searchTerm]);

  // Handle actions
  const actions = useMemo(() => [
    {
      label: 'Download CSV',
      onClick: async (selectedRows: PaymentData[]) => {
        console.log('Downloading CSV for:', selectedRows);
      },
      variant: 'default' as const,
    },
  ], []);

  // Handle selection
  const [selectedRows, setSelectedRows] = useState<PaymentData[]>([]);
  const selection = useMemo(() => ({
    mode: 'multiple' as const,
    selectedRows,
    onSelectionChange: setSelectedRows,
  }), [selectedRows]);

  return (
    <div className="space-y-6">
      {/* Global Summary Dashboard */}
      {data?.summary && (
        <div className="grid gap-6">
          {/* Credits Issued Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credits Issued
              </CardTitle>
              <CardDescription>
                Breakdown of credits issued by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Admin Issued</div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(data.summary.creditsIssuedByAdmin)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Signup Gifts</div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(data.summary.creditsIssuedBySignupGift)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Stripe Payments</div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.summary.creditsIssuedByStripe)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Stripe Fees (2.9%)</div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(data.summary.stripeFeesCollected)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Spending Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Global Spending
              </CardTitle>
              <CardDescription>
                Platform-wide spending breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.summary.totalSpentAcrossAllApps)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Free Tier Spending</div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(data.summary.totalSpentOnFreeTier)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">User Balance Spending</div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(data.summary.totalSpentOnUserBalances)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Earnings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Global Earnings
              </CardTitle>
              <CardDescription>
                Platform-wide earnings and payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Referral Profit Earned</div>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(data.summary.totalReferralProfitEarned)}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Claimed: {formatCurrency(data.summary.totalReferralProfitClaimed)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Markup Profit Earned</div>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(data.summary.totalMarkupProfitEarned)}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Claimed: {formatCurrency(data.summary.totalMarkupProfitClaimed)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Transaction Costs</div>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(data.summary.totalSpentOnTransactionCosts)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Table */}
      <AdminDataGrid<PaymentData>
        title="Payment Details"
        data={data?.payments || []}
        columnDefs={columnDefs}
        loading={isLoading}
        error={error?.message || null}
        pagination={pagination}
        globalSearch={globalSearch}
        selection={selection}
        actions={actions}
        onRefresh={() => refetch()}
        className="min-h-[600px]"
      />
    </div>
  );
}