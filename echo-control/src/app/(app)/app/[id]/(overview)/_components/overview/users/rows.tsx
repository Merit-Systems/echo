import React from 'react';

import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { EmptyTableRow } from '../lib/table';

import type { api } from '@/trpc/server';

import { formatCurrency } from '@/lib/utils';

interface Props {
  usersPromise: Promise<
    Awaited<ReturnType<typeof api.apps.app.users.list>>['items']
  >;
}

export const UserRows: React.FC<Props> = async ({ usersPromise }) => {
  const users = await usersPromise;

  if (users.length === 0) {
    return <EmptyTableRow>No users yet</EmptyTableRow>;
  }

  return users.map(user => (
    <TableRow key={user.id}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <UserAvatar src={user.image} className="size-8" />
          <p className="text-sm font-medium">{user.name}</p>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {user.usage.totalTransactions}
      </TableCell>
      <TableCell className="text-center">
        {formatCurrency(user.usage.rawCost)}
      </TableCell>
      <TableCell className="text-right pr-4 text-primary font-bold">
        {formatCurrency(user.usage.markupProfit)}
      </TableCell>
    </TableRow>
  ));
};

export const LoadingUserRows = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="w-16 h-4" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="w-16 h-4 mx-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-16 h-4 mx-auto" />
      </TableCell>
      <TableCell className="pr-4">
        <Skeleton className="w-16 h-4 ml-auto" />
      </TableCell>
    </TableRow>
  ));
};
