import { userOrRedirect } from '@/auth/user-or-redirect';
import { Heading, Body } from '../../../_components/layout/page-utils';

import { GenerateKey } from './_components/generate-key';
import { Keys } from './_components/keys';

import { api, HydrateClient } from '@/trpc/server';

import { checkAppExists } from '../_lib/checks';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keys',
};

export default async function AppKeysPage(props: PageProps<'/app/[id]/keys'>) {
  const { id } = await props.params;

  await userOrRedirect(`/app/${id}/keys`, props);
  await checkAppExists(id);

  const { generate } = await props.searchParams;

  api.user.apiKeys.list.prefetchInfinite({ appId: id });

  return (
    <HydrateClient>
      <Heading
        title="API Keys"
        actions={<GenerateKey appId={id} generate={Boolean(generate)} />}
      />
      <Body>
        <Keys appId={id} />
      </Body>
    </HydrateClient>
  );
}
