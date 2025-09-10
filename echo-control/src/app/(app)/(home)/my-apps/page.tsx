import { Body, Heading } from '../../_components/layout/page-utils';
import { MyApps } from './_components/apps';

import { NewAppButton } from './_components/new-app-button';

import { userOrRedirect } from '@/auth/user-or-redirect';

import { api, HydrateClient } from '@/trpc/server';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Apps',
};

export default async function MyAppsPage(props: PageProps<'/my-apps'>) {
  await userOrRedirect('/my-apps', props);

  void api.apps.list.owner.prefetchInfinite({
    page_size: 10,
  });

  return (
    <HydrateClient>
      <Heading
        title="My Apps"
        description="Applications that you own and manage"
        actions={<NewAppButton />}
      />
      <Body>
        <MyApps />
      </Body>
    </HydrateClient>
  );
}
