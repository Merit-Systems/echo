import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { endOfDay, subDays } from 'date-fns';

import { Card } from '@/components/ui/card';

import { api, HydrateClient } from '@/trpc/server';

import { RangeSelector } from '@/app/(app)/@authenticated/_components/activity-data-selectors/range-selector';
import { ViewModeSelector } from '@/app/(app)/@authenticated/_components/activity-data-selectors/view-mode-selector';
import { ActivityCharts, LoadingActivityCharts } from './charts';
import { ActivityContextProvider } from '@/app/(app)/@authenticated/_components/activity-data-selectors/context';
import { ActivityOverlay } from './overlay';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityTimeframe } from '@/app/(app)/@authenticated/_components/activity-data-selectors/types';

interface Props {
  appId: string;
  createdAt: Date;
}

const ActivityContainer = ({
  children,
  isLoading = false,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
}) => {
  return (
    <div className="w-full flex flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">App Activity</h3>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-24 h-6" />
            </>
          ) : (
            <>
              <ViewModeSelector />
              <RangeSelector />
            </>
          )}
        </div>
      </div>
      <Card className="p-0 overflow-hidden relative">{children}</Card>
    </div>
  );
};

export const Activity: React.FC<Props> = ({ appId, createdAt }) => {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  // If app was created more than 7 days ago, use 7-day timeframe
  // If app was created less than 7 days ago, use "All Time" from creation date
  const isAppOlderThan7Days = createdAt < sevenDaysAgo;

  const defaultStartDate = isAppOlderThan7Days ? sevenDaysAgo : createdAt;
  const defaultEndDate = endOfDay(now);
  const initialTimeframe = isAppOlderThan7Days
    ? ActivityTimeframe.SevenDays
    : ActivityTimeframe.AllTime;
  api.apps.app.stats.bucketed.prefetch({
    appId,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    isCumulative: false, // Default to non-cumulative for prefetch
  });

  return (
    <HydrateClient>
      <ActivityContextProvider
        initialStartDate={defaultStartDate}
        initialEndDate={defaultEndDate}
        initialTimeframe={initialTimeframe}
        createdAt={createdAt}
      >
        <ActivityContainer>
          <ErrorBoundary
            fallback={<p>There was an error loading the activity data</p>}
          >
            <Suspense fallback={<LoadingActivityCharts />}>
              <ActivityCharts appId={appId} />
            </Suspense>
          </ErrorBoundary>
          <ActivityOverlay appId={appId} />
        </ActivityContainer>
      </ActivityContextProvider>
    </HydrateClient>
  );
};

export const LoadingActivity = () => {
  return (
    <ActivityContainer isLoading>
      <LoadingActivityCharts />
    </ActivityContainer>
  );
};
