'use client';

import { api } from '@/trpc/client';

import { KeysTable as KeysTableBase } from '@/app/(app)/_components/keys/table/table';

export const KeysTable = () => {
  const [{ pages }, { fetchNextPage, isFetchingNextPage }] =
    api.user.apiKeys.list.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam(lastPage) {
          return lastPage.has_next ? lastPage.page + 1 : undefined;
        },
      }
    );

  const keys = pages.flatMap(page => page.items);

  return (
    <KeysTableBase
      keys={keys}
      pagination={{
        hasNext: pages[pages.length - 1].has_next,
        fetchNextPage,
        isFetchingNextPage,
      }}
    />
  );
};
