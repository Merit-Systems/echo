import { Payments } from './_components/payments';

import { Heading, Body } from '../../_components/layout/page-utils';

import { Balance } from './_components/balance';

import { api, HydrateClient } from '@/trpc/server';

import type { Metadata } from 'next';
import { userOrRedirect } from '@/auth/user-or-redirect';

export const metadata: Metadata = {
  title: 'Credits',
};

export default async function CreditsPage(props: PageProps<'/credits'>) {
  await userOrRedirect('/credits', props);

  void api.user.payments.list.prefetchInfinite({
    cursor: 0,
  });

  void api.user.balance.get.prefetch();

  return (
    <HydrateClient>
      <Heading
        title="Credits"
        description="These credits can be used to make LLM requests on any Echo app."
      />
      <Body>
        <Balance />
        <Payments />
      </Body>
    </HydrateClient>
  );
}
