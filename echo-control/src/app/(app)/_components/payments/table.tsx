'use client';

import { Loader2 } from 'lucide-react';

import { format } from 'date-fns';

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

import { LoadingPaymentStatus, PaymentStatus } from './status';

import { formatCurrency } from '@/lib/balance';
import { Skeleton } from '@/components/ui/skeleton';

interface MinimalPayment {
  id: string;
  createdAt: string;
  description: string | null;
  amount: number;
  status: string;
}

interface Pagination {
  hasNext: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

interface Props {
  payments: MinimalPayment[];
  pagination: Pagination;
}

export const PaymentsTable: React.FC<Props> = ({ payments, pagination }) => {
  return (
    <BasePaymentsTable pagination={pagination}>
      {payments.length > 0 ? (
        <PaymentRows payments={payments} />
      ) : (
        <TableEmpty colSpan={4}>No payments found</TableEmpty>
      )}
    </BasePaymentsTable>
  );
};

export const LoadingPaymentsTable = () => {
  return (
    <BasePaymentsTable>
      <LoadingPaymentRow />
      <LoadingPaymentRow />
    </BasePaymentsTable>
  );
};

const PaymentRows = ({ payments }: { payments: MinimalPayment[] }) => {
  return payments.map(payment => (
    <PaymentRow key={payment.id} payment={payment} />
  ));
};

const PaymentRow = ({ payment }: { payment: MinimalPayment }) => {
  return (
    <TableRow key={payment.id}>
      <TableCell className="pl-4 font-bold">
        {formatCurrency(Number(payment.amount))}
      </TableCell>
      <TableCell>
        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
      </TableCell>
      <TableCell>{payment.description ?? 'Echo Credits Purchase'}</TableCell>
      <TableCell>
        <PaymentStatus status={payment.status} />
      </TableCell>
    </TableRow>
  );
};

const LoadingPaymentRow = () => {
  return (
    <TableRow>
      <TableCell className="pl-4 font-bold">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <LoadingPaymentStatus />
      </TableCell>
    </TableRow>
  );
};

interface BasePaymentsTableProps {
  children: React.ReactNode;
  pagination?: Pagination;
}

const BasePaymentsTable = ({
  children,
  pagination,
}: BasePaymentsTableProps) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
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
