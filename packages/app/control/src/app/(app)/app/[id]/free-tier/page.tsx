import { Suspense } from 'react';

import { Body, Heading } from '../../../_components/layout/page-utils';

import { Balance } from './_components/balance';
import { Payments } from './_components/payments';
import { Details, LoadingFreeTierDetails } from './_components/details';

import { api, HydrateClient } from '@/trpc/server';
import {
  FreeTierUsersTable,
  LoadingFreeTierUsersTable,
} from './_components/users';

import { userOrRedirect } from '@/auth/user-or-redirect';

import type { Metadata } from 'next';
import { checkAppExists, checkIsAppOwner } from '../_lib/checks';

export const metadata: Metadata = {
  title: 'Free Tier',
};

export default async function FreeTierPage(
  props: PageProps<'/app/[id]/free-tier'>
) {
  const { id } = await props.params;

  await userOrRedirect(`/app/${id}/free-tier`, props);
  await checkAppExists(id);
  await checkIsAppOwner(id);

  api.apps.app.freeTier.payments.list.prefetchInfinite({
    appId: id,
  });
  api.apps.app.freeTier.get.prefetch({
    appId: id,
  });
  api.apps.app.freeTier.users.list.prefetchInfinite({
    appId: id,
  });

  return (
    <HydrateClient>
      <Heading
        title="Free Tier"
        description="Allow your users to test out your app for free before they have to buy credits and spend their echo balance."
      />
      <Body>
        <div className="flex flex-col gap-2">
          <Balance appId={id} />
          <Suspense fallback={<LoadingFreeTierDetails />}>
            <Details appId={id} />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingFreeTierUsersTable />}>
          <FreeTierUsersTable appId={id} />
        </Suspense>
        <Payments appId={id} />
      </Body>
    </HydrateClient>
  );
}
