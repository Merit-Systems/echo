import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { endOfDay, subDays } from 'date-fns';

import { Card } from '@/components/ui/card';

import { api, HydrateClient } from '@/trpc/server';

import { RangeSelector } from '../../../../../../_components/activity-data-selectors/range-selector';
import { ViewModeSelector } from '../../../../../../_components/activity-data-selectors/view-mode-selector';
import { ActivityCharts, LoadingActivityCharts } from './charts';
import { ActivityContextProvider } from '../../../../../../_components/activity-data-selectors/context';
import { ActivityOverlay } from './overlay';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  appId: string;
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

export const Activity: React.FC<Props> = ({ appId }) => {
  const defaultStartDate = subDays(new Date(), 7);
  const defaultEndDate = endOfDay(new Date());

  api.apps.app.activity.get.prefetch({
    appId,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  return (
    <HydrateClient>
      <ActivityContextProvider
        initialStartDate={defaultStartDate}
        initialEndDate={defaultEndDate}
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
