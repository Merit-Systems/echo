'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { AppCard, LoadingAppCard } from './card';

import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Info, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NewAppButton } from '../new-app-button';

export const MyApps = () => {
  return (
    <ErrorBoundary fallback={<div>There was an error loading your apps</div>}>
      <Suspense fallback={<LoadingApps />}>
        <Apps />
      </Suspense>
    </ErrorBoundary>
  );
};

const Apps = () => {
  const [apps, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.apps.list.owner.useSuspenseInfiniteQuery(
      {
        page_size: 10,
      },
      {
        getNextPageParam: lastPage =>
          lastPage.has_next ? lastPage.page + 1 : undefined,
      }
    );

  const items = apps.pages.flatMap(page => page.items);

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-4 p-8">
        <Info className="size-10" />
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-semibold">
            You haven&apos;t created any apps yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Ready to get started? Creating an app will take you less than 2
            minutes.
          </p>
        </div>
        <NewAppButton />
      </Card>
    );
  }

  return (
    <AppsContainer>
      {items.map(app => (
        <AppCard key={app.id} {...app} />
      ))}
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
    </AppsContainer>
  );
};

export const LoadingApps = () => {
  return (
    <AppsContainer>
      {Array.from({ length: 3 }).map((_, i) => (
        <LoadingAppCard key={i} />
      ))}
    </AppsContainer>
  );
};

const AppsContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
