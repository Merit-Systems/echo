import React, { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { endOfDay, subDays } from 'date-fns';

import { Card } from '@/components/ui/card';

import { api, HydrateClient } from '@/trpc/server';

import { RangeSelector } from '@/app/(app)/@authenticated/_components/activity-data-selectors/range-selector';
import { ActivityContextProvider } from '@/app/(app)/@authenticated/_components/activity-data-selectors/context';

import { ActivityCharts, LoadingActivityCharts } from './charts';
import { ActivityOverlay } from './overlay';
import { ViewModeSelector } from '@/app/(app)/@authenticated/_components/activity-data-selectors/view-mode-selector';
import { ActivityTimeframe } from '@/app/(app)/@authenticated/_components/activity-data-selectors/types';

const ActivityContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full flex flex-col gap-2 md:gap-3 max-w-full">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Your Earnings</h3>
        <div className="flex items-center gap-2">
          <ViewModeSelector />
          <RangeSelector />
        </div>
      </div>
      <Card className="p-0 overflow-hidden relative">{children}</Card>
    </div>
  );
};

export const Activity: React.FC = () => {
  const defaultStartDate = subDays(new Date(), 7);
  const defaultEndDate = endOfDay(new Date());

  api.activity.creator.getCurrent.prefetch({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    isCumulative: false, // Default to non-cumulative for prefetch
  });
  api.apps.count.owner.prefetch();

  return (
    <HydrateClient>
      <ActivityContextProvider
        initialStartDate={defaultStartDate}
        initialEndDate={defaultEndDate}
        initialTimeframe={ActivityTimeframe.SevenDays}
        createdAt={undefined}
      >
        <ActivityContainer>
          <ErrorBoundary
            fallback={<p>There was an error loading the activity data</p>}
          >
            <Suspense fallback={<LoadingActivityCharts />}>
              <ActivityCharts />
            </Suspense>
          </ErrorBoundary>
          <Suspense fallback={null}>
            <ErrorBoundary fallback={null}>
              <ActivityOverlay />
            </ErrorBoundary>
          </Suspense>
        </ActivityContainer>
      </ActivityContextProvider>
    </HydrateClient>
  );
};

export const LoadingActivity = () => {
  return (
    <ActivityContainer>
      <LoadingActivityCharts />
    </ActivityContainer>
  );
};
