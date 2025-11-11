import { Body, Heading } from '../../_components/layout/page-utils';
import { TopApps } from './_components/apps';

import { userOrRedirect } from '@/auth/user-or-redirect';

import { api, HydrateClient } from '@/trpc/server';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Apps',
};

export default async function TopAppsPage(props: PageProps<'/top-apps'>) {
  await userOrRedirect('/top-apps', props);

  void api.apps.list.public.prefetchInfinite({
    page_size: 20,
  });

  return (
    <HydrateClient>
      <Heading
        title="Top Apps"
        description="Echo apps with the highest LLM usage"
      />
      <Body>
        <TopApps />
      </Body>
    </HydrateClient>
  );
}
