import React, { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Card } from '@/components/ui/card';

import { api, HydrateClient } from '@/trpc/server';

import { RangeSelector } from '@/app/(app)/_components/time-range-selector/range-selector';
import { ActivityContextProvider } from '@/app/(app)/_components/time-range-selector/context';

import { EarningsCharts, LoadingEarningsCharts } from './charts';
import { ActivityOverlay } from './overlay';

import { SubSection } from '../../utils';

interface Props {
  numAppsPromise: Promise<number>;
}

export const Earnings: React.FC<Props> = async ({ numAppsPromise }) => {
  const user = await api.user.current();
  if (!user) {
    throw new Error('User not found');
  }

  await api.user.creatorActivity.prefetch({
    startDate: user.createdAt,
  });

  return (
    <HydrateClient>
      <ActivityContextProvider creationDate={user.createdAt}>
        <ActivityContainer>
          <ErrorBoundary
            fallback={<p>There was an error loading the activity data</p>}
          >
            <Suspense fallback={<LoadingEarningsCharts />}>
              <EarningsCharts numAppsPromise={numAppsPromise} />
            </Suspense>
          </ErrorBoundary>
          <Suspense fallback={null}>
            <ErrorBoundary fallback={null}>
              <ActivityOverlay numAppsPromise={numAppsPromise} />
            </ErrorBoundary>
          </Suspense>
        </ActivityContainer>
      </ActivityContextProvider>
    </HydrateClient>
  );
};

export const LoadingEarnings = () => {
  return (
    <ActivityContainer>
      <LoadingEarningsCharts />
    </ActivityContainer>
  );
};

const ActivityContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <SubSection title="Earnings" actions={<RangeSelector />}>
      <Card className="p-0 overflow-hidden relative flex-1">{children}</Card>
    </SubSection>
  );
};
