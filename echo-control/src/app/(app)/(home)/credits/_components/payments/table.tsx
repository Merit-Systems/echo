'use client';

import { api } from '@/trpc/client';

import { PaymentsTable as BasePaymentsTable } from '@/app/(app)/_components/payments/table';

export const PaymentsTable = () => {
  const [{ pages }, { fetchNextPage, isFetchingNextPage }] =
    api.user.payments.list.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam(lastPage) {
          return lastPage.has_next ? lastPage.page + 1 : undefined;
        },
      }
    );

  const flatPages = pages.flatMap(page => page.items);

  return (
    <BasePaymentsTable
      payments={flatPages.map(item => ({
        id: item.id,
        createdAt: item.createdAt,
        description: item.description,
        amount: item.amount,
        status: item.status,
      }))}
      pagination={{
        hasNext: pages[pages.length - 1].has_next,
        fetchNextPage: () => void fetchNextPage(),
        isFetchingNextPage,
      }}
    />
  );
};
