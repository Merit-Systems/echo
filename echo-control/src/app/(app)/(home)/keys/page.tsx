import { Heading, Body } from '../../_components/layout/page-utils';

import { api, HydrateClient } from '@/trpc/server';

import { Keys } from './_components/keys';
import { GenerateKey } from './_components/generate-key';

import { userOrRedirect } from '@/auth/user-or-redirect';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keys',
};

export default async function KeysPage(props: PageProps<'/keys'>) {
  await userOrRedirect('/keys', props);

  void api.user.apiKeys.list.prefetchInfinite({});
  void api.apps.list.member.prefetchInfinite({});

  return (
    <HydrateClient>
      <Heading
        title="API Keys"
        description="All of the API keys that you have generated"
        actions={<GenerateKey />}
      />
      <Body>
        <Keys />
      </Body>
    </HydrateClient>
  );
}
