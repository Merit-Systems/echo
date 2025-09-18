'use client';

import { Loader2, Settings, Share } from 'lucide-react';

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

import { formatCurrency } from '@/lib/balance';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/client';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';

interface Pagination {
  hasNext: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

export const CreditGrantsTable = () => {
  const [creditGrants, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.admin.creditGrants.list.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam(lastPage) {
          return lastPage.has_next ? lastPage.page + 1 : undefined;
        },
      }
    );

  return (
    <BaseCreditGrantTable
      pagination={{
        hasNext: hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
      }}
    >
      {creditGrants.pages.flatMap(page => page.items).length > 0 ? (
        creditGrants.pages
          .flatMap(page => page.items)
          .map(creditGrant => (
            <TableRow key={creditGrant.id}>
              <TableCell className="pl-4 font-bold">
                {creditGrant.name ?? 'Unnamed Credit Grant'}
              </TableCell>
              <TableCell className="font-bold">
                {formatCurrency(Number(creditGrant.grantAmount))}
              </TableCell>
              <TableCell>{creditGrant.maxUses || 'Unlimited'}</TableCell>
              <TableCell>{creditGrant.maxUsesPerUser || 'Unlimited'}</TableCell>
              <TableCell>{creditGrant.uses}</TableCell>
              <TableCell>
                {format(creditGrant.expiresAt, 'MM/dd/yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/credit-grants/${creditGrant.code}`}>
                    <Button size="xs" variant="outline">
                      <Settings className="size-3" />
                      Settings
                    </Button>
                  </Link>
                  <Link href={`/admin/credit-grants/${creditGrant.code}/share`}>
                    <Button size="xs">
                      <Share className="size-3" />
                      Share
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))
      ) : (
        <TableEmpty colSpan={4}>No credit grants found</TableEmpty>
      )}
    </BaseCreditGrantTable>
  );
};

export const LoadingCreditGrantTable = () => {
  return (
    <BaseCreditGrantTable>
      <LoadingCreditGrantRow />
      <LoadingCreditGrantRow />
    </BaseCreditGrantTable>
  );
};

const LoadingCreditGrantRow = () => {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
};

interface BaseCreditGrantTableProps {
  children: React.ReactNode;
  pagination?: Pagination;
}

const BaseCreditGrantTable: React.FC<BaseCreditGrantTableProps> = ({
  children,
  pagination,
}: BaseCreditGrantTableProps) => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>Credit Grants</CardTitle>
        <CardDescription>
          Manage and mint referral codes for users to get free credits
        </CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Max Uses</TableHead>
            <TableHead>Max / Per User</TableHead>
            <TableHead>Uses</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
