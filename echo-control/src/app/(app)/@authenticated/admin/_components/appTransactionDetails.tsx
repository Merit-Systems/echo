'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/trpc/client';
import { PaymentStatus } from '@/lib/payment-processing';
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Activity,
  DollarSign,
  Clock,
  User,
  Zap,
  Search,
  Calendar,
  Hash,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { formatNumber } from '@/components/app-detail';

interface AppTransactionDetailsProps {
  appId: string;
  appName?: string;
}

export function AppTransactionDetails({
  appId,
  appName,
}: AppTransactionDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('pageSize')) || 25
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch transaction totals
  const { data: totals, isLoading: totalsLoading } =
    api.admin.transactions.getAppTransactionTotals.useQuery({
      appId,
    });

  // Fetch paginated transactions
  const {
    data: transactionData,
    isLoading: transactionsLoading,
    error,
  } = api.admin.transactions.getAppTransactions.useQuery({
    appId,
    page,
    pageSize,
  });

  const isLoading = totalsLoading || transactionsLoading;
  const pagination = transactionData?.pagination;

  // Filter transactions based on search
  const filteredTransactions = useMemo(() => {
    const transactions = transactionData?.transactions || [];
    if (!searchTerm.trim()) return transactions;

    const term = searchTerm.toLowerCase();
    return transactions.filter(
      transaction =>
        transaction.user.email.toLowerCase().includes(term) ||
        transaction.user.name?.toLowerCase().includes(term) ||
        transaction.id.includes(term) ||
        transaction.metadata?.provider.toLowerCase().includes(term) ||
        transaction.metadata?.model.toLowerCase().includes(term) ||
        transaction.apiKey?.name?.toLowerCase().includes(term) ||
        transaction.spendPool?.name.toLowerCase().includes(term)
    );
  }, [transactionData?.transactions, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newPageSize.toString());
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Transaction Data
          </CardTitle>
          <CardDescription>
            {error.message || 'Failed to load transaction data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Transaction Details</h1>
          <p className="text-muted-foreground">
            {appName || totals?.appName || 'App'} •{' '}
            {totals?.totalTransactions || 0} total transactions
          </p>
        </div>
      </div>

      {/* App Summary */}
      {totals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              App Overview
            </CardTitle>
            <CardDescription>
              Complete transaction summary for {totals.appName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Total Transactions
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(totals.totalTransactions)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Cost</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.totalCost)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Unique Users</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(totals.uniqueUsers)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Tokens</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(totals.totalTokens)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  App Profit
                </span>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totals.totalAppProfit)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Markup Profit
                </span>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totals.totalMarkUpProfit)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Referral Profit
                </span>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(totals.totalReferralProfit)}
                </p>
              </div>
            </div>

            {totals.dateRange.earliest && totals.dateRange.latest && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(totals.dateRange.earliest)} →{' '}
                  {formatDate(totals.dateRange.latest)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of{' '}
                {pagination?.total || 0} transactions
              </CardDescription>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <select
                value={pageSize}
                onChange={e => handlePageSizeChange(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Provider/Model</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {formatRelativeTime(transaction.createdAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {transaction.user.name || 'No name'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-32">
                          {transaction.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.metadata ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {transaction.metadata.provider}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.metadata.model}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No metadata
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatCurrency(transaction.totalCost)}
                        </div>
                        {transaction.metadata?.toolCost &&
                          transaction.metadata.toolCost > 0 && (
                            <div className="text-xs text-muted-foreground">
                              +{formatCurrency(transaction.metadata.toolCost)}{' '}
                              tools
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.metadata ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {formatNumber(transaction.metadata.totalTokens)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(transaction.metadata.inputTokens)}→
                            {formatNumber(transaction.metadata.outputTokens)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm text-green-600 font-medium">
                          {formatCurrency(transaction.appProfit)}
                        </div>
                        {(transaction.markUpProfit > 0 ||
                          transaction.referralProfit > 0) && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.markUpProfit > 0 &&
                              `+${formatCurrency(transaction.markUpProfit)} markup`}
                            {transaction.referralProfit > 0 &&
                              ` +${formatCurrency(transaction.referralProfit)} referral`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {formatCurrency(transaction.runningTotalSpent)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          App total
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {transaction.spendPool ? (
                          <Badge variant="secondary" className="text-xs">
                            Pool: {transaction.spendPool.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Direct
                          </Badge>
                        )}
                        {transaction.apiKey?.name && (
                          <div className="text-xs text-muted-foreground truncate max-w-24">
                            {transaction.apiKey.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === PaymentStatus.COMPLETED
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {transaction.status || PaymentStatus.COMPLETED}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )}{' '}
                of {pagination.total} transactions
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevious}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  <span className="text-sm">Page</span>
                  <Input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
                    value={pagination.page}
                    onChange={e => {
                      const newPage = Number(e.target.value);
                      if (newPage >= 1 && newPage <= pagination.totalPages) {
                        handlePageChange(newPage);
                      }
                    }}
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-sm">of {pagination.totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNext}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">
                No transactions found
              </div>
              <div className="text-sm text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No transactions recorded for this app yet'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
