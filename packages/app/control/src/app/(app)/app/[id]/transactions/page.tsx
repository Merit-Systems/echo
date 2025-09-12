import { Suspense } from 'react';

import { Card } from '@/components/ui/card';

import { Body, Heading } from '../../../_components/layout/page-utils';

import {
  LoadingTransactionsTable,
  TransactionsTable,
} from './_components/transactions';

import { api, HydrateClient } from '@/trpc/server';

import { userOrRedirect } from '@/auth/user-or-redirect';
import { checkAppExists } from '../_lib/checks';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Transactions',
    template: 'Transactions | %s',
  },
};

export default async function TransactionsPage(
  props: PageProps<'/app/[id]/transactions'>
) {
  const { id } = await props.params;

  await checkAppExists(id);

  await userOrRedirect(`/app/${id}/transactions`, props);

  api.apps.app.transactions.list.prefetchInfinite({
    appId: id,
    page_size: 200,
  });

  return (
    <HydrateClient>
      <Heading title="Transactions" />
      <Body className="gap-0">
        <Card className="overflow-hidden">
          <Suspense fallback={<LoadingTransactionsTable />}>
            <TransactionsTable appId={id} />
          </Suspense>
        </Card>
      </Body>
    </HydrateClient>
  );
}
