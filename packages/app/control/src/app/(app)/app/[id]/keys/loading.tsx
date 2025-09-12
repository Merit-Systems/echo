import { Heading, Body } from '../../../_components/layout/page-utils';

import { LoadingKeys } from './_components/keys';

import { HydrateClient } from '@/trpc/server';

export default async function AppKeysLoading() {
  return (
    <HydrateClient>
      <Heading title="API Keys" />
      <Body>
        <LoadingKeys />
      </Body>
    </HydrateClient>
  );
}
