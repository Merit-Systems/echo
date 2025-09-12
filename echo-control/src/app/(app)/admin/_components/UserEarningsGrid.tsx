'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/client';
import { AdminDataGrid } from './AdminDataGrid';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserEarningsData {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalTransactions: number;
  totalCost: number;
  totalAppProfit: number;
  totalMarkUpProfit: number;
  totalReferralProfit: number;
  totalApps: number;
  totalReferralCodes: number;
  totalReferrerUsers: number;
  emailCampaignsReceived: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function UserEarningsGrid() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('totalCost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch data
  const { data, isLoading, error, refetch } = api.admin.earnings.getUsersEarningsWithCampaignsPaginated.useQuery({
    page,
    pageSize,
    searchTerm: searchTerm || undefined,
    sortField,
    sortDirection,
  });

  const { data: availableCampaigns } = api.admin.emailCampaigns.list.useQuery();
  const scheduleMutation = api.admin.emailCampaigns.scheduleForApps.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Column definitions for AG-Grid
  const columnDefs = useMemo<ColDef<UserEarningsData>[]>(() => [
    {
      headerName: 'User',
      field: 'userName',
      minWidth: 280,
      flex: 2,
      cellRenderer: ({ data }: { data: UserEarningsData }) => (
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
      headerName: 'Email Campaigns',
      field: 'emailCampaignsReceived',
      minWidth: 240,
      flex: 1.5,
      cellRenderer: (params: { value: unknown; data?: { emailCampaignsReceived?: string[] } }) => {
        const items = Array.isArray(params?.data?.emailCampaignsReceived) ? params.data!.emailCampaignsReceived! : [];
        return (
          <div className="flex flex-wrap gap-1">
            {items.map((campaign, idx) => (
              <Badge key={`${campaign}-${idx}`} variant="outline" className="text-xs">
                {campaign}
              </Badge>
            ))}
            {items.length === 0 && (
              <Badge variant="secondary" className="text-xs">
                None
              </Badge>
            )}
          </div>
        );
      },
      sortable: false,
      // Use text filter with valueGetter to support community module only
      filter: 'agTextColumnFilter',
      valueGetter: (params) => (params.data?.emailCampaignsReceived || []).join(', '),
    },
    {
      headerName: 'Transactions',
      field: 'totalTransactions',
      width: 130,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatNumber(value),
    },
    {
      headerName: 'Total Revenue',
      field: 'totalCost',
      width: 150,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatCurrency(value),
    },
    {
      headerName: 'App Profit',
      field: 'totalAppProfit',
      width: 130,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Markup Profit',
      field: 'totalMarkUpProfit',
      width: 150,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-blue-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Referral Profit',
      field: 'totalReferralProfit',
      width: 150,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-purple-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Referral Codes',
      field: 'totalReferralCodes',
      width: 150,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatNumber(value),
    },
    {
      headerName: 'Referrer Users',
      field: 'totalReferrerUsers',
      width: 150,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatNumber(value),
    },
    {
      headerName: 'Apps',
      field: 'totalApps',
      width: 90,
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
      width: 110,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: UserEarningsData }) => (
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
      onClick: async (selectedRows: UserEarningsData[]) => {
        // TODO: Implement CSV download
        console.log('Downloading CSV for:', selectedRows);
      },
      variant: 'default' as const,
    },
  ], []);

  // Handle selection
  const [selectedRows, setSelectedRows] = useState<UserEarningsData[]>([]);
  const selection = useMemo(() => ({
    mode: 'multiple' as const,
    selectedRows,
    onSelectionChange: setSelectedRows,
  }), [selectedRows]);

  return (
    <div className="space-y-6">
      {/* Global Summary */}
      {data?.globalTotals && (
        <Card>
          <CardHeader>
            <CardTitle>User Earnings Summary</CardTitle>
            <CardDescription>
              Platform-wide earnings aggregation across all users and apps
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
                <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.globalTotals.totalCost)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Transactions</div>
                <p className="text-2xl font-bold">
                  {formatNumber(data.globalTotals.totalTransactions)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  App Profit
                </span>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(data.globalTotals.totalAppProfit)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Markup Profit
                </span>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(data.globalTotals.totalMarkUpProfit)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Referral Profit
                </span>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(data.globalTotals.totalReferralProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Grid */}
      <AdminDataGrid<UserEarningsData>
        title="User Earnings"
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
    </div>
  );
}