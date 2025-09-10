'use client';

import { Activity, Loader2 } from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { formatCurrency } from '@/lib/balance';
import { api } from '@/trpc/client';

interface Transaction {
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  date: Date;
  callCount: number;
  markUpProfit: number;
}

interface Pagination {
  hasNext: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

interface Props {
  appId: string;
}

export const TransactionsTable: React.FC<Props> = ({ appId }) => {
  const [transactions, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.apps.app.transactions.list.useSuspenseInfiniteQuery(
      { appId, page_size: 200 },
      {
        getNextPageParam: lastPage =>
          lastPage.has_next ? lastPage.page + 1 : undefined,
      }
    );

  const rows = transactions.pages.flatMap(page => page.items);

  return (
    <BaseTransactionsTable
      pagination={
        hasNextPage
          ? {
              hasNext: hasNextPage,
              fetchNextPage: () => void fetchNextPage(),
              isFetchingNextPage,
            }
          : undefined
      }
    >
      {rows.length > 0 ? (
        <TransactionRows
          transactions={rows.map(row => ({
            id: row.id,
            user: row.user,
            date: row.date,
            callCount: row.callCount,
            markUpProfit: row.markUpProfit,
          }))}
        />
      ) : (
        <TableEmpty colSpan={4}>No activity found</TableEmpty>
      )}
    </BaseTransactionsTable>
  );
};

export const LoadingTransactionsTable = () => {
  return (
    <BaseTransactionsTable>
      <LoadingTransactionRow />
      <LoadingTransactionRow />
    </BaseTransactionsTable>
  );
};

const TransactionRows = ({ transactions }: { transactions: Transaction[] }) => {
  return transactions.map(transaction => (
    <TransactionRow key={transaction.id} transaction={transaction} />
  ));
};

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  return (
    <TableRow key={transaction.id}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <UserAvatar src={transaction.user.image} className="size-8" />
          <div className="flex flex-col items-start">
            <p className="text-sm leading-tight">
              <span className="font-medium">{transaction.user.name}</span> made{' '}
              {transaction.callCount} requests
            </p>
            <p className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(transaction.date, {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right pr-4 text-primary font-bold">
        {formatCurrency(transaction.markUpProfit)}
      </TableCell>
    </TableRow>
  );
};

const LoadingTransactionRow = () => {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="size-6" />
          <Skeleton className="w-32 h-4" />
        </div>
      </TableCell>
      <TableCell className="pr-4">
        <Skeleton className="w-16 h-4 ml-auto" />
      </TableCell>
    </TableRow>
  );
};

interface BaseTransactionsTableProps {
  children: React.ReactNode;
  pagination?: Pagination;
}

const BaseTransactionsTable = ({
  children,
  pagination,
}: BaseTransactionsTableProps) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent text-xs">
            <TableHead className="pl-4 flex items-center gap-2">
              <div className="size-6 flex items-center justify-center bg-muted rounded-md">
                <Activity className="size-4" />
              </div>
              Activity
            </TableHead>
            <TableHead className="text-right pr-4">Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
      {pagination?.hasNext && (
        <div className="flex justify-center">
          <Button
            onClick={pagination.fetchNextPage}
            className="w-full"
            variant="ghost"
            disabled={pagination.isFetchingNextPage}
            size="sm"
          >
            {pagination.isFetchingNextPage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </>
  );
};
