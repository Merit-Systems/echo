import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { PaymentsCard } from '@/app/(app)/_components/payments/card';

import { PaymentsTable } from './table';
import { LoadingPaymentsTable } from '@/app/(app)/_components/payments/table';

export const Payments: React.FC = () => {
  return (
    <PaymentsCard title="Recent Payments">
      <ErrorBoundary fallback={<div>Error loading payments</div>}>
        <Suspense fallback={<LoadingPaymentsTable />}>
          <PaymentsTable />
        </Suspense>
      </ErrorBoundary>
    </PaymentsCard>
  );
};

export const LoadingPayments = () => {
  return (
    <PaymentsCard title="Recent Payments">
      <LoadingPaymentsTable />
    </PaymentsCard>
  );
};
