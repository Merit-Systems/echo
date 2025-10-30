import { formatDistanceToNow } from 'date-fns';

import { TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { EmptyTableRow, TableCell } from '../lib/table';

import { api } from '@/trpc/server';

import { formatCurrency } from '@/lib/utils';

export const TransactionRows = async ({ appId }: { appId: string }) => {
  const transactions = await api.apps.app.transactions.list({
    appId,
    page_size: 1000,
  });

  const rows = transactions.items;

  if (rows.length === 0) {
    return <EmptyTableRow>No transactions yet</EmptyTableRow>;
  }

  return rows.slice(0, 5).map(transaction => (
    <TableRow key={transaction.id}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <UserAvatar src={transaction.user.image} className="size-8" />
          <div className="flex flex-col items-start">
            <p className="text-sm leading-tight">
              <span className="font-medium">
                {transaction.user.name ?? 'x402 Users'}
              </span>{' '}
              made {transaction.callCount} requests
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
  ));
};

export const LoadingTransactionRows = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="w-32 h-4" />
        </div>
      </TableCell>
      <TableCell className="pr-4">
        <Skeleton className="w-16 h-4 ml-auto" />
      </TableCell>
    </TableRow>
  ));
};
