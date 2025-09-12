'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

type SortField =
  | 'appName'
  | 'transactionCount'
  | 'totalCost'
  | 'appProfit'
  | 'markUpProfit'
  | 'referralProfit'
  | 'totalTokens'
  | 'apiKeyCount'
  | 'refreshTokenCount';
type SortDirection = 'asc' | 'desc';

type AppRow = {
  appId: string;
  appName: string;
  transactionCount: number;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  totalTokens: number;
  apiKeyCount: number;
  refreshTokenCount: number;
};

export function AppEarningsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalCost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data: availableCampaigns } = api.admin.emailCampaigns.list.useQuery();
  const [selectedCampaignKey, setSelectedCampaignKey] = useState<string>('');
  const [onlyNotReceived, setOnlyNotReceived] = useState<boolean>(false);

  const {
    data: appsResp,
    isLoading,
    error,
  } = api.admin.earnings.getAppsWithCampaignsPaginated.useQuery({
    cursor: currentPage,
    page_size: pageSize,
    filterCampaignKey: selectedCampaignKey || undefined,
    onlyNotReceived,
  });

  const pagination = appsResp?.pagination;

  // selection state
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());

  const scheduleMutation =
    api.admin.emailCampaigns.scheduleForApps.useMutation();

  const apps: AppRow[] = useMemo(() => {
    const rows = (appsResp?.apps ?? []).map(a => ({
      appId: a.appId,
      appName: a.appName,
      transactionCount: a.transactionCount,
      totalCost: a.totalCost,
      appProfit: a.appProfit,
      markUpProfit: a.markUpProfit,
      referralProfit: a.referralProfit,
      totalTokens: a.totalTokens,
      apiKeyCount: a.apiKeyCount ?? 0,
      refreshTokenCount: a.refreshTokenCount ?? 0,
    }));

    let filtered = rows;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.appName.toLowerCase().includes(term) ||
          a.appId.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;
      switch (sortField) {
        case 'appName':
          aValue = a.appName;
          bValue = b.appName;
          break;
        case 'transactionCount':
          aValue = a.transactionCount;
          bValue = b.transactionCount;
          break;
        case 'totalCost':
          aValue = a.totalCost;
          bValue = b.totalCost;
          break;
        case 'appProfit':
          aValue = a.appProfit;
          bValue = b.appProfit;
          break;
        case 'markUpProfit':
          aValue = a.markUpProfit;
          bValue = b.markUpProfit;
          break;
        case 'referralProfit':
          aValue = a.referralProfit;
          bValue = b.referralProfit;
          break;
        case 'totalTokens':
          aValue = a.totalTokens;
          bValue = b.totalTokens;
          break;
        case 'apiKeyCount':
          aValue = a.apiKeyCount;
          bValue = b.apiKeyCount;
          break;
        case 'refreshTokenCount':
          aValue = a.refreshTokenCount;
          bValue = b.refreshTokenCount;
          break;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [appsResp?.apps, searchTerm, sortField, sortDirection]);

  const sentByApp = useMemo(() => {
    const map: Record<string, string[]> = {};
    (appsResp?.apps ?? []).forEach(a => {
      map[a.appId] = a.sentCampaigns;
    });
    return map;
  }, [appsResp?.apps]);

  const allSelected = useMemo(() => {
    return (
      selectedAppIds.size > 0 &&
      apps.length > 0 &&
      selectedAppIds.size === apps.length
    );
  }, [selectedAppIds, apps]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppIds(new Set(apps.map(a => a.appId)));
    } else {
      setSelectedAppIds(new Set());
    }
  };

  const toggleSelectOne = (appId: string, checked: boolean) => {
    setSelectedAppIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(appId);
      else next.delete(appId);
      return next;
    });
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaignKey || selectedAppIds.size === 0) return;
    await scheduleMutation.mutateAsync({
      campaignKey: selectedCampaignKey,
      appIds: Array.from(selectedAppIds),
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </span>
    </Button>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Earnings Data
          </CardTitle>
          <CardDescription>
            {error.message || 'Failed to load app earnings data'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                App Earnings Overview
              </CardTitle>
              <CardDescription>
                Comprehensive earnings data aggregated by app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-64 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search apps..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {apps.length} app{apps.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCampaignKey}
                  onValueChange={setSelectedCampaignKey}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableCampaigns ?? []).map(c => (
                      <SelectItem key={c.key} value={c.key}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyNotReceived}
                    onChange={e => setOnlyNotReceived(e.target.checked)}
                  />
                  Only not received
                </label>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSendCampaign}
                  disabled={
                    !selectedCampaignKey ||
                    selectedAppIds.size === 0 ||
                    scheduleMutation.isPending
                  }
                >
                  Send to Selected ({selectedAppIds.size})
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={e => toggleSelectAll(e.target.checked)}
                      aria-label="Select all"
                      className="h-4 w-4"
                    />
                  </TableHead>
                  <TableHead className="w-64 min-w-0">
                    <SortButton field="appName">App</SortButton>
                  </TableHead>
                  <TableHead className="text-right w-24">
                    <SortButton field="transactionCount">
                      Transactions
                    </SortButton>
                  </TableHead>
                  <TableHead className="text-right w-24">
                    <SortButton field="apiKeyCount">API Keys</SortButton>
                  </TableHead>
                  <TableHead className="text-right w-28">
                    <SortButton field="refreshTokenCount">
                      Refresh Tokens
                    </SortButton>
                  </TableHead>
                  <TableHead className="text-right w-28">
                    <SortButton field="totalCost">Total Revenue</SortButton>
                  </TableHead>
                  <TableHead className="text-right w-24">
                    <SortButton field="appProfit">App Profit</SortButton>
                  </TableHead>
                  <TableHead className="text-right w-28">
                    <SortButton field="markUpProfit">Markup Profit</SortButton>
                  </TableHead>
                  <TableHead className="text-right w-28">
                    <SortButton field="referralProfit">
                      Referral Profit
                    </SortButton>
                  </TableHead>
                  <TableHead className="text-right w-28">
                    <SortButton field="totalTokens">Tokens</SortButton>
                  </TableHead>
                  <TableHead className="w-64">Prev Campaigns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map(app => (
                  <TableRow key={app.appId}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedAppIds.has(app.appId)}
                        onChange={e =>
                          toggleSelectOne(app.appId, e.target.checked)
                        }
                        aria-label={`Select ${app.appName}`}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/apps/${app.appId}`}
                          className="hover:underline"
                          title={app.appName}
                        >
                          <button className="font-medium text-sm hover:text-primary hover:underline cursor-pointer text-left block truncate max-w-full">
                            {app.appName}
                          </button>
                        </Link>
                        <div
                          className="text-xs text-muted-foreground truncate max-w-full"
                          title={app.appId}
                        >
                          {app.appId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatNumber(app.transactionCount)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatNumber(app.apiKeyCount)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatNumber(app.refreshTokenCount)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(app.totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600 whitespace-nowrap">
                      {formatCurrency(app.appProfit)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600 whitespace-nowrap">
                      {formatCurrency(app.markUpProfit)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-purple-600 whitespace-nowrap">
                      {formatCurrency(app.referralProfit)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge variant="secondary">
                        {formatNumber(app.totalTokens)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(sentByApp?.[app.appId] ?? []).map(key => (
                          <Badge key={key} variant="outline">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing users {currentPage * pageSize + 1} to{' '}
                {Math.min((currentPage + 1) * pageSize, pagination.total)} of{' '}
                {pagination.total}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Rows per page:
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={value => {
                      setPageSize(parseInt(value));
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of{' '}
                    {Math.ceil(pagination.total / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasMore}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
