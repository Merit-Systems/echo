'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { addHours } from 'date-fns';

import { Info, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { FeedItem, LoadingFeedItem } from './item';

import { api } from '@/trpc/client';
import { useFiltersContext } from '../../contexts/filters-context';

export const ActivityList = () => {
  return (
    <ErrorBoundary
      fallback={<p>There was an error loading the activity list</p>}
    >
      <Suspense fallback={<LoadingActivityList />}>
        <ActivityItems />
      </Suspense>
    </ErrorBoundary>
  );
};

const ActivityItems = () => {
  const numHours = 4;

  const { appId, startDate, endDate, eventType } = useFiltersContext();

  const [{ pages }, { fetchNextPage, hasNextPage, isFetchingNextPage }] =
    api.user.feed.list.useSuspenseInfiniteQuery(
      {
        limit: 10,
        numHours,
        appIds: appId ? [appId] : undefined,
        startDate,
        endDate,
        eventTypes: eventType ? [eventType] : undefined,
      },
      {
        getNextPageParam: lastPage =>
          lastPage.has_next
            ? lastPage.items[lastPage.items.length - 1].timestamp
            : undefined,
      }
    );

  const items = pages.flatMap(page =>
    page.items.map(item => ({
      ...item,
      timestamp: addHours(item.timestamp, numHours),
    }))
  );

  return (
    <div className="flex flex-col gap-4">
      <ActivityListContainer>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <Info className="size-10" />
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-lg font-semibold">No Activity Found</h2>
              <p>There is no activity for the selected filters.</p>
            </div>
          </div>
        ) : (
          items.map((item, index) => (
            <FeedItem
              key={`${item.timestamp.toString()}-${index}`}
              activity={item}
            />
          ))
        )}
      </ActivityListContainer>
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          variant="outline"
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Load more'
          )}
        </Button>
      )}
    </div>
  );
};

export const LoadingActivityList = () => {
  return (
    <ActivityListContainer>
      {Array.from({ length: 10 }).map((_, index) => (
        <LoadingFeedItem key={index} index={index} />
      ))}
    </ActivityListContainer>
  );
};

const ActivityListContainer = ({ children }: { children: React.ReactNode }) => {
  return <Card>{children}</Card>;
};
