'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/client';
import { AdminDataGrid } from './AdminDataGrid';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_CAMPAIGNS_VALUE = '__all__';

interface AppEarningsData {
  appId: string;
  appName: string;
  ownerId?: string;
  ownerName?: string | null;
  ownerEmail?: string;
  transactionCount: number;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  totalTokens: number;
  apiKeyCount?: number;
  refreshTokenCount?: number;
  sentCampaigns: string[];
  ownerEmailCampaigns?: string[];
  totalReferralCodes?: number;
}

export function AppEarningsGrid() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [_sortField, _setSortField] = useState<string>('totalCost');
  const [_sortDirection, _setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaignKey, setSelectedCampaignKey] = useState<string>('');
  const [onlyNotReceived, setOnlyNotReceived] = useState<boolean>(false);

  // Fetch data
  const { data, isLoading, error, refetch } = api.admin.earnings.getAppsWithCampaignsPaginated.useQuery({
    cursor: page,
    page_size: pageSize,
    filterCampaignKey: selectedCampaignKey || undefined,
    onlyNotReceived,
  });

  const { data: availableCampaigns } = api.admin.emailCampaigns.list.useQuery();
  const scheduleMutation = api.admin.emailCampaigns.scheduleForApps.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Transform API data to match our interface
  const transformedData = useMemo<AppEarningsData[]>(() => {
    if (!data?.apps) return [];

    return data.apps.map((app) => ({
      appId: app.appId,
      appName: app.appName,
      transactionCount: app.transactionCount,
      totalCost: app.totalCost,
      appProfit: app.appProfit,
      markUpProfit: app.markUpProfit,
      referralProfit: app.referralProfit,
      totalTokens: app.totalTokens,
      apiKeyCount: app.apiKeyCount || 0,
      refreshTokenCount: app.refreshTokenCount || 0,
      sentCampaigns: app.sentCampaigns || [],
    }));
  }, [data?.apps]);

  // Column definitions for AG-Grid
  const columnDefs = useMemo<ColDef<AppEarningsData>[]>(() => [
    {
      headerName: 'App',
      field: 'appName',
      minWidth: 250,
      flex: 1,
      cellRenderer: ({ data }: { data: AppEarningsData }) => (
        <div className="flex flex-col">
          <Link href={`/admin/apps/${data.appId}`} className="font-medium hover:underline text-blue-600">
            {data.appName}
          </Link>
          <span className="text-sm text-muted-foreground">{data.appId}</span>
        </div>
      ),
    },
    {
      headerName: 'Owner',
      field: 'ownerName',
      minWidth: 200,
      cellRenderer: ({ data }: { data: AppEarningsData }) => {
        if (data.ownerId) {
          return (
            <div className="flex flex-col">
              <Link href={`/admin/users/${data.ownerId}`} className="font-medium hover:underline text-blue-600">
                {data.ownerName || 'No name'}
              </Link>
              <span className="text-sm text-muted-foreground">{data.ownerEmail}</span>
            </div>
          );
        }
        return <span className="text-muted-foreground">No owner</span>;
      },
      sortable: false,
    },
    {
      headerName: 'App Campaigns',
      field: 'sentCampaigns',
      minWidth: 150,
      cellRenderer: (params: { value: unknown; data?: { sentCampaigns?: string[] } }) => {
        const items = Array.isArray(params?.data?.sentCampaigns) ? params.data!.sentCampaigns! : [];
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
      valueGetter: (params) => (params.data?.sentCampaigns || []).join(', '),
    },
    {
      headerName: 'Owner Campaigns',
      field: 'ownerEmailCampaigns',
      minWidth: 150,
      cellRenderer: (params: { value: unknown; data?: { ownerEmailCampaigns?: string[] } }) => {
        const items = Array.isArray(params?.data?.ownerEmailCampaigns) ? params.data!.ownerEmailCampaigns! : [];
        return (
          <div className="flex flex-wrap gap-1">
            {items.map((campaign, idx) => (
              <Badge key={`${campaign}-${idx}`} variant="secondary" className="text-xs">
                {campaign}
              </Badge>
            ))}
            {items.length === 0 && (
              <Badge variant="outline" className="text-xs">
                None
              </Badge>
            )}
          </div>
        );
      },
      sortable: false,
      // Use text filter with valueGetter to support community module only
      filter: 'agTextColumnFilter',
      valueGetter: (params) => (params.data?.ownerEmailCampaigns || []).join(', '),
    },
    {
      headerName: 'Transactions',
      field: 'transactionCount',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatNumber(value),
    },
    {
      headerName: 'Total Revenue',
      field: 'totalCost',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => formatCurrency(value),
    },
    {
      headerName: 'App Profit',
      field: 'appProfit',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Markup Profit',
      field: 'markUpProfit',
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <span className="text-blue-600 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      headerName: 'Referral Profit',
      field: 'referralProfit',
      width: 140,
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
      width: 140,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value?: number }) => formatNumber(value || 0),
    },
    {
      headerName: 'Tokens',
      field: 'totalTokens',
      width: 120,
      type: 'numericColumn',
      cellRenderer: ({ value }: { value: number }) => (
        <Badge variant="secondary">
          {formatNumber(value)}
        </Badge>
      ),
    },
    {
      headerName: 'Actions',
      field: 'appId',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: AppEarningsData }) => (
        <Link href={`/admin/apps/${data.appId}`}>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ], []);

  // Handle pagination
  const pagination = useMemo(() => {
    if (!data?.pagination) return undefined;

    return {
      page: data.pagination.page + 1, // AG-Grid uses 1-based pagination in UI
      pageSize: data.pagination.pageSize,
      total: data.pagination.total,
      totalPages: Math.ceil(data.pagination.total / data.pagination.pageSize),
      onPageChange: (newPage: number) => setPage(newPage - 1), // Convert back to 0-based
      onPageSizeChange: (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(0);
      },
    };
  }, [data?.pagination]);

  // Handle global search
  const globalSearch = useMemo(() => ({
    value: searchTerm,
    onChange: (value: string) => {
      setSearchTerm(value);
      setPage(0);
    },
    placeholder: 'Search apps by name or ID...',
  }), [searchTerm]);

  // Handle actions for email campaigns
  const actions = useMemo(() => [
    {
      label: 'Send Email Campaign',
      onClick: async (selectedRows: AppEarningsData[]) => {
        if (!selectedCampaignKey || selectedRows.length === 0) return;

        await scheduleMutation.mutateAsync({
          campaignKey: selectedCampaignKey,
          appIds: selectedRows.map(row => row.appId),
        });
      },
      disabled: (selectedRows: AppEarningsData[]) => !selectedCampaignKey || selectedRows.length === 0 || scheduleMutation.isPending,
      variant: 'default' as const,
    },
  ], [selectedCampaignKey, scheduleMutation]);

  // Handle selection
  const [selectedRows, setSelectedRows] = useState<AppEarningsData[]>([]);
  const selection = useMemo(() => ({
    mode: 'multiple' as const,
    selectedRows,
    onSelectionChange: setSelectedRows,
  }), [selectedRows]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>App Earnings Filters</CardTitle>
          <CardDescription>
            Filter apps by email campaigns and other criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Email Campaign</label>
              <Select
                value={selectedCampaignKey || ALL_CAMPAIGNS_VALUE}
                onValueChange={(value) => {
                  const next = value === ALL_CAMPAIGNS_VALUE ? '' : value;
                  setSelectedCampaignKey(next);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select campaign filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CAMPAIGNS_VALUE}>All campaigns</SelectItem>
                  {(availableCampaigns || []).map((campaign, idx) => (
                    <SelectItem key={`${campaign.key}-${idx}`} value={campaign.key}>
                      {campaign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="onlyNotReceived"
                checked={onlyNotReceived}
                onChange={(e) => {
                  setOnlyNotReceived(e.target.checked);
                  setPage(0);
                }}
                className="h-4 w-4"
              />
              <label htmlFor="onlyNotReceived" className="text-sm font-medium">
                Only apps that haven&apos;t received selected campaign
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <AdminDataGrid<AppEarningsData>
        title="App Earnings"
        data={transformedData}
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