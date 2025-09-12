'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/client';
import { AdminDataGrid } from './AdminDataGrid';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserSpendingData {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalSpent: number;
  currentBalance: number;
  freeTierPoolUsage: number;
  personalBalanceUsage: number;
  totalStripePayments: number;
  totalTransactions: number;
  totalApps: number;
  appBreakdowns: AppSpendingBreakdown[];
  createdAt: Date;
  updatedAt: Date;
}

interface AppSpendingBreakdown {
  appId: string;
  appName: string;
  totalSpent: number;
  freeTierUsage: number;
  personalBalanceUsage: number;
  transactionCount: number;
  totalTokens: number;
}

export function UserSpendingGrid() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('totalSpent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch data
  const { data, isLoading, error, refetch } = api.admin.spending.getUsersSpendingEnhancedPaginated.useQuery({
    page,
    pageSize,
    searchTerm: searchTerm || undefined,
    sortField,
    sortDirection,
  });

  // Column definitions for AG-Grid
  const columnDefs = useMemo<ColDef<UserSpendingData>[]>(() => [
    {
      headerName: '',
      field: 'userId',
      width: 50,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: UserSpendingData }) => {
        if (data.appBreakdowns.length === 0) return null;
        
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => {
              const newExpanded = new Set(expandedRows);
              if (newExpanded.has(data.userId)) {
                newExpanded.delete(data.userId);
              } else {
                newExpanded.add(data.userId);
              }
              setExpandedRows(newExpanded);
            }}
          >
            {expandedRows.has(data.userId) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        );
      },
    },
    {
      headerName: 'User',
      field: 'userName',
      minWidth: 250,
      flex: 1,
      cellRenderer: ({ data }: { data: UserSpendingData }) => (
        <div className="flex flex-col">
          <Link href={`/admin/users/${data.userId}`} className="font-medium hover:underline text-blue-600">
            {data.userName || 'No name'}
          </Link>
          <span className="text-sm text-muted-foreground">{data.userEmail}</span>
        </div>
      ),
      comparator: (valueA, valueB, nodeA, nodeB) => {
        const nameA = (nodeA.data as unknown as Record<string, unknown>).userName || (nodeA.data as unknown as Record<string, unknown>).userEmail;
        const nameB = (nodeB.data as unknown as Record<string, unknown>).userName || (nodeB.data as unknown as Record<string, unknown>).userEmail;
        return String(nameA).localeCompare(String(nameB));
      },
    },
    {
      headerName: 'Total Spent',
      field: 'totalSpent',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Current Balance',
      field: 'currentBalance',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className={`font-medium ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Free Tier Usage',
      field: 'freeTierPoolUsage',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-blue-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Personal Balance Usage',
      field: 'personalBalanceUsage',
      width: 180,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-purple-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Stripe Payments',
      field: 'totalStripePayments',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Transactions',
      field: 'totalTransactions',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatNumber(value),
    },
    {
      headerName: 'Apps',
      field: 'totalApps',
      width: 80,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <Badge variant="secondary">
          {formatNumber(value)}
        </Badge>
      ),
    },
    {
      headerName: 'Actions',
      field: 'userId',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: UserSpendingData }) => (
        <Link href={`/admin/users/${data.userId}`}>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ], [expandedRows]);

  // Handle pagination
  const pagination = useMemo(() => {
    if (!data) return undefined;

    return {
      page: data.pagination.page + 1, // AG-Grid uses 1-based pagination in UI
      pageSize: data.pagination.pageSize,
      total: data.pagination.total,
      totalPages: data.pagination.totalPages,
      onPageChange: (newPage: number) => setPage(newPage - 1), // Convert back to 0-based
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
    placeholder: 'Search users, emails, or user IDs...',
  }), [searchTerm]);

  // Handle actions
  const actions = useMemo(() => [
    {
      label: 'Download CSV',
      onClick: async (selectedRows: UserSpendingData[]) => {
        console.log('Downloading CSV for:', selectedRows);
      },
      variant: 'default' as const,
    },
  ], []);

  // Handle selection
  const [selectedRows, setSelectedRows] = useState<UserSpendingData[]>([]);
  const selection = useMemo(() => ({
    mode: 'multiple' as const,
    selectedRows,
    onSelectionChange: setSelectedRows,
  }), [selectedRows]);

  // Render app breakdown rows
  const getExpandedRowsData = () => {
    const expandedData: Record<string, unknown>[] = [];
    
    if (data?.users) {
      data.users.forEach((user) => {
        if (expandedRows.has(user.userId)) {
          user.appBreakdowns.forEach((app, index) => {
            expandedData.push({
              id: `${user.userId}-${app.appId}`,
              isAppBreakdown: true,
              parentUserId: user.userId,
              appId: app.appId,
              appName: app.appName,
              totalSpent: app.totalSpent,
              freeTierUsage: app.freeTierUsage,
              personalBalanceUsage: app.personalBalanceUsage,
              transactionCount: app.transactionCount,
              totalTokens: app.totalTokens,
            });
          });
        }
      });
    }
    
    return expandedData;
  };

  return (
    <div className="space-y-6">
      {/* Global Summary */}
      {data?.globalTotals && (
        <Card>
          <CardHeader>
            <CardTitle>User Spending Summary</CardTitle>
            <CardDescription>
              Platform-wide spending aggregation across all users and apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                <p className="text-2xl font-bold">
                  {formatNumber(data.globalTotals.totalUsers)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Apps</div>
                <p className="text-2xl font-bold">
                  {formatNumber(data.globalTotals.totalApps)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.globalTotals.totalSpent)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Transactions</div>
                <p className="text-2xl font-bold">
                  {formatNumber(data.globalTotals.totalTransactions)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Current Balance
                </span>
                <p className={`text-lg font-bold ${data.globalTotals.totalCurrentBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(data.globalTotals.totalCurrentBalance)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Free Tier Usage
                </span>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(data.globalTotals.totalFreeTierUsage)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Personal Balance Usage
                </span>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(data.globalTotals.totalPersonalBalanceUsage)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Stripe Payments
                </span>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(data.globalTotals.totalStripePayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Grid */}
      <AdminDataGrid<UserSpendingData>
        title="User Spending"
        data={data?.users || []}
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

      {/* App Breakdowns for expanded rows */}
      {expandedRows.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>App Spending Breakdowns</CardTitle>
            <CardDescription>
              Detailed spending breakdown by app for selected users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.users
                .filter(user => expandedRows.has(user.userId))
                .map(user => (
                  <div key={user.userId} className="border rounded-lg p-4">
                    <div className="font-medium mb-3">
                      {user.userName || 'No name'} ({user.userEmail})
                    </div>
                    <div className="grid gap-2">
                      {user.appBreakdowns.map(app => (
                        <div key={app.appId} className="flex items-center justify-between bg-muted/20 p-3 rounded">
                          <div className="flex-1">
                            <Link href={`/admin/apps/${app.appId}`} className="font-medium hover:underline text-blue-600">
                              {app.appName}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(app.transactionCount)} transactions • {formatNumber(app.totalTokens)} tokens
                            </div>
                          </div>
                          <div className="flex gap-4 text-right">
                            <div>
                              <div className="text-sm font-medium">Total: {formatCurrency(app.totalSpent)}</div>
                              <div className="text-xs text-muted-foreground">
                                Free: {formatCurrency(app.freeTierUsage)} | Personal: {formatCurrency(app.personalBalanceUsage)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}