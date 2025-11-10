'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import {
  AppCard,
  LoadingAppCard,
} from '@/app/(app)/_components/apps/card/horizontal';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/trpc/client';
import { Info, Loader2 } from 'lucide-react';

export const TopApps = () => {
  return (
    <ErrorBoundary
      fallback={<div>There was an error loading the top apps</div>}
    >
      <Suspense fallback={<LoadingApps />}>
        <Apps />
      </Suspense>
    </ErrorBoundary>
  );
};

const Apps = () => {
  const [apps, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.apps.list.public.useSuspenseInfiniteQuery(
      {
        page_size: 20,
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
          <h2 className="text-lg font-semibold">No apps found</h2>
        </div>
      </Card>
    );
  }

  return (
    <AppsContainer>
      <AppsHeader />
      {items.map(app => {
        if (!app) return null;
        return (
          <AppCard
            key={app.id}
            id={app.id}
            name={app.name}
            description={app.description}
            profilePictureUrl={app.profilePictureUrl}
            homepageUrl={app.homepageUrl}
          />
        );
      })}
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
      <AppsHeader />
      {Array.from({ length: 3 }).map((_, i) => (
        <LoadingAppCard key={i} />
      ))}
    </AppsContainer>
  );
};

const AppsHeader = () => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 px-4 pb-2 text-sm font-semibold text-muted-foreground">
      <div className="col-span-2 sm:col-span-3">App</div>
      <div className="hidden lg:flex justify-center col-span-1">Users</div>
      <div className="hidden sm:flex justify-center col-span-1">
        Transactions
      </div>
      <div className="hidden lg:flex justify-center col-span-1">Tokens</div>
      <div className="flex justify-center col-span-1">Usage</div>
      <div className="flex justify-end col-span-1">Earnings</div>
    </div>
  );
};

const AppsContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
