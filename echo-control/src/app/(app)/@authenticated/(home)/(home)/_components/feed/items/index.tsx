'use client';

import { api } from '@/trpc/client';
import { FeedItem, LoadingFeedItem } from './item';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const FeedItems = () => {
  const [feed, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.user.feed.list.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: lastPage =>
          lastPage.has_next
            ? lastPage.items[lastPage.items.length - 1].timestamp
            : undefined,
      }
    );

  const rows = feed.pages.flatMap(page => page.items);

  if (rows.length === 0) {
    return (
      <div className="w-full flex flex-col gap-2 md:gap-3 p-2">
        <p className="text-xs text-muted-foreground/60">
          No activity on your apps yet
        </p>
      </div>
    );
  }

  return (
    <>
      {rows.map((item, index) => (
        <FeedItem
          key={`${item.timestamp.toString()}-${index}`}
          activity={item}
        />
      ))}
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          variant="ghost"
          disabled={isFetchingNextPage}
          className="w-full h-fit py-1 text-xs text-muted-foreground/60 rounded-none"
        >
          {isFetchingNextPage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Load more'
          )}
        </Button>
      )}
    </>
  );
};

export const LoadingFeedItems = () => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <LoadingFeedItem key={index} />
      ))}
    </>
  );
};
