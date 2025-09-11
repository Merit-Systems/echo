import { Body, Heading } from '../../_components/layout/page-utils';

import { ActivityList } from './_components/list';
import { FiltersContextProvider } from './contexts/filters-context';
import { ActivityFilters } from './_components/filters';

import { userOrRedirect } from '@/auth/user-or-redirect';

import { api, HydrateClient } from '@/trpc/server';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity',
};

export default async function ActivityPage(props: PageProps<'/activity'>) {
  await userOrRedirect('/activity', props);

  void api.apps.list.owner.prefetchInfinite({});
  void api.user.feed.list.prefetchInfinite({
    limit: 10,
    numHours: 4,
  });

  return (
    <HydrateClient>
      <Heading
        title="Activity"
        description="Here's what's been happening with your apps"
      />
      <Body className="gap-4">
        <FiltersContextProvider>
          <ActivityFilters />
          <ActivityList />
        </FiltersContextProvider>
      </Body>
    </HydrateClient>
  );
}
