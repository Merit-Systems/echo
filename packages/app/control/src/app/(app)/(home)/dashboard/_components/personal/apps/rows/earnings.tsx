import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Skeleton } from '@/components/ui/skeleton';

import { api } from '@/trpc/server';

import { formatCurrency } from '@/lib/utils';

interface Props {
  appId: string;
}

export const Earnings: React.FC<Props> = ({ appId }) => {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Suspense fallback={<LoadingEarningsAmount />}>
        <EarningsAmount appId={appId} />
      </Suspense>
    </ErrorBoundary>
  );
};

const EarningsAmount: React.FC<Props> = async ({ appId }) => {
  const earnings = await api.apps.app.earnings.get({ appId });
  return (
    <span className="text-sm font-bold text-primary">
      {formatCurrency(earnings)}
    </span>
  );
};

export const LoadingEarningsAmount = () => {
  return <Skeleton className="h-4 w-16" />;
};
