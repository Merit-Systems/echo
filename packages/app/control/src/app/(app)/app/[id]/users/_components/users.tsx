'use client';

import { Loader2, User, Download, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { InfinitePaginationProps } from '@/types/infinite-pagination';
import { useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  totalTransactions: number;
  rawCost: number;
  totalProfit: number;
}

interface Props {
  appId: string;
}

export const UsersTable: React.FC<Props> = ({ appId }) => {
  const [users, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.apps.app.users.list.useSuspenseInfiniteQuery(
      { appId },
      {
        getNextPageParam: lastPage =>
          lastPage.has_next ? lastPage.page + 1 : undefined,
      }
    );

  const [isOwner] = api.apps.app.isOwner.useSuspenseQuery(appId);

  const rows = users.pages.flatMap(page => page.items);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Transactions', 'Cost', 'Profit'];
    const csvData = [
      headers.join(','),
      ...rows.map(row =>
        [
          `"${row.name || ''}"`,
          `"${row.email || ''}"`,
          row.usage.totalTransactions,
          row.usage.rawCost,
          row.usage.markupProfit,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${appId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyEmails = async () => {
    const emails = rows
      .map(row => row.email)
      .filter(email => email)
      .join(', ');

    await navigator.clipboard.writeText(emails);
  };

  return (
    <>
      {/* Export Actions */}
      {rows.length > 0 && isOwner && (
        <div className="flex justify-end gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Export CSV
          </Button>
          <CopyEmailsButton onCopyEmails={copyEmails} />
        </div>
      )}

      <BaseUsersTable
        showEmail={isOwner}
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
              email: row.email,
              image: row.image,
              totalTransactions: row.usage.totalTransactions,
              rawCost: row.usage.rawCost,
              totalProfit: row.usage.markupProfit,
            }))}
            showEmail={isOwner}
          />
        ) : (
          <TableEmpty colSpan={isOwner ? 5 : 4}>No users found</TableEmpty>
        )}
      </BaseUsersTable>
    </>
  );
};

export const LoadingUsersTable = () => {
  return (
    <BaseUsersTable>
      <LoadingUserRow />
      <LoadingUserRow />
    </BaseUsersTable>
  );
};

const CopyEmailsButton = ({
  onCopyEmails,
}: {
  onCopyEmails: () => Promise<void>;
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyEmails = async () => {
    await onCopyEmails();
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Button onClick={handleCopyEmails} variant="outline" size="sm">
      {copySuccess ? (
        <>
          <Check className="size-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="size-4 mr-2" />
          Copy Emails
        </>
      )}
    </Button>
  );
};

const UserRows = ({
  users,
  showEmail,
}: {
  users: User[];
  showEmail: boolean;
}) => {
  return users.map(user => (
    <UserRow key={user.id} user={user} showEmail={showEmail} />
  ));
};

const UserRow = ({ user, showEmail }: { user: User; showEmail: boolean }) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="pl-4">
        <div className="flex flex-row items-center gap-2">
          <UserAvatar src={user.image} className="size-6" />
          <p className="text-sm font-medium">{user.name}</p>
        </div>
      </TableCell>
      {showEmail && (
        <TableCell className="text-left">
          <p className="text-sm text-muted-foreground">
            {user.email || 'No email'}
          </p>
        </TableCell>
      )}
      <TableCell className="text-center">{user.totalTransactions}</TableCell>
      <TableCell className="text-center">
        {formatCurrency(user.rawCost)}
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
        <Skeleton className="h-4 w-24" />
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
  showEmail?: boolean;
}

const BaseUsersTable = ({
  children,
  pagination,
  showEmail = true,
}: BaseUsersTableProps) => {
  return (
    <>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent text-xs">
              <TableHead className="pl-4 flex items-center gap-2">
                <div className="size-6 flex items-center justify-center bg-muted rounded-md">
                  <User className="size-4" />
                </div>
                Name
              </TableHead>
              {showEmail && <TableHead className="text-left">Email</TableHead>}
              <TableHead className="text-center">Transactions</TableHead>
              <TableHead className="text-center">Cost</TableHead>
              <TableHead className="text-right pr-4">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </Card>
      {pagination?.hasNext && (
        <div className="flex justify-center p-4">
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
