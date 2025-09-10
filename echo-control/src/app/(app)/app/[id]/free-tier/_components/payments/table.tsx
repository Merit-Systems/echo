'use client';

import { PaymentsTable as PaymentsTableBase } from '@/app/(app)/_components/payments/table';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const PaymentsTable = ({ appId }: Props) => {
  const [{ pages }, { fetchNextPage, isFetchingNextPage }] =
    api.apps.app.freeTier.payments.list.useSuspenseInfiniteQuery(
      {
        appId,
      },
      {
        getNextPageParam(lastPage) {
          return lastPage.has_next ? lastPage.page + 1 : undefined;
        },
      }
    );

  const flatPages = pages.flatMap(page => page.items);

  return (
    <PaymentsTableBase
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
