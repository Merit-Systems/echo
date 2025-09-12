import { Suspense } from 'react';

import { PaymentsCard } from '@/app/(app)/_components/payments/card';

import { PaymentsTable } from './table';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingPaymentsTable } from '@/app/(app)/_components/payments/table';

interface Props {
  appId: string;
}

export const Payments: React.FC<Props> = ({ appId }) => {
  return (
    <PaymentsCard title="Recent Payments">
      <ErrorBoundary fallback={<div>Error loading payments</div>}>
        <Suspense fallback={<LoadingPaymentsTable />}>
          <PaymentsTable appId={appId} />
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
