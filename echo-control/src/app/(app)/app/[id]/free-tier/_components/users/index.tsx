'use client';

import { Loader2, User } from 'lucide-react';

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
import type { InfinitePaginationProps } from '@/types/infinite-pagination';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  totalTransactions: number;
  totalCost: number;
  totalProfit: number;
}

interface Props {
  appId: string;
}

export const FreeTierUsersTable: React.FC<Props> = ({ appId }) => {
  const [freeTier] = api.apps.app.freeTier.get.useSuspenseQuery({
    appId,
  });
  const [users, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.apps.app.freeTier.users.list.useSuspenseInfiniteQuery(
      { appId },
      {
        getNextPageParam: lastPage =>
          lastPage.has_next ? lastPage.page + 1 : undefined,
      }
    );

  const rows = users.pages.flatMap(page => page.items);

  return (
    <BaseUsersTable
      pagination={
        hasNextPage
          ? {
              hasNext: hasNextPage,
              fetchNextPage,
              isFetchingNextPage,
            }
          : undefined
      }
    >
      {rows.length > 0 ? (
        <UserRows
          users={rows.map(row => ({
            id: row.id,
            name: row.name,
            image: row.image,
            totalTransactions: row.usage.totalTransactions,
            totalCost: row.usage.totalCost,
            totalProfit: row.usage.markupProfit,
          }))}
        />
      ) : (
        <TableEmpty colSpan={4}>
          {freeTier
            ? 'No free tier created yet'
            : 'No users have used the free tier yet'}
        </TableEmpty>
      )}
    </BaseUsersTable>
  );
};

export const LoadingFreeTierUsersTable = () => {
  return (
    <BaseUsersTable>
      <LoadingUserRow />
      <LoadingUserRow />
    </BaseUsersTable>
  );
};

const UserRows = ({ users }: { users: User[] }) => {
  return users.map(user => <UserRow key={user.id} user={user} />);
};

const UserRow = ({ user }: { user: User }) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <UserAvatar src={user.image} className="size-6" />
          <p className="text-sm font-medium">{user.name}</p>
        </div>
      </TableCell>
      <TableCell className="text-center">{user.totalTransactions}</TableCell>
      <TableCell className="text-center">
        {formatCurrency(user.totalCost)}
      </TableCell>
      <TableCell className="text-right pr-4 text-primary font-bold">
        {formatCurrency(user.totalProfit)}
      </TableCell>
    </TableRow>
  );
};

const LoadingUserRow = () => {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="size-6" />
          <Skeleton className="h-4 w-16" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8 mx-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8 mx-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8 ml-auto" />
      </TableCell>
    </TableRow>
  );
};

interface BaseUsersTableProps {
  children: React.ReactNode;
  pagination?: InfinitePaginationProps;
}

const BaseUsersTable = ({ children, pagination }: BaseUsersTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Free Tier Users</CardTitle>
        <CardDescription>Users who have used the free tier. </CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent text-xs">
            <TableHead className="pl-4 flex items-center gap-2">
              <div className="size-6 flex items-center justify-center bg-muted rounded-md">
                <User className="size-4" />
              </div>
              Name
            </TableHead>
            <TableHead className="text-center">Transactions</TableHead>
            <TableHead className="text-center">Total Spent</TableHead>
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
    </Card>
  );
};
