import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Body } from '../../../_components/layout/page-utils';

import { api, HydrateClient } from '@/trpc/server';

import { HeaderCard, LoadingHeaderCard } from './_components/header';
import { Setup } from './_components/setup';
import { Overview } from './_components/overview';
import { ReferralHandler } from './_components/referral-handler';
import { userOrRedirect } from '@/auth/user-or-redirect';

export default async function AppPage(props: PageProps<'/app/[id]'>) {
  const { id } = await props.params;

  await userOrRedirect(`/app/${id}` as const, props);

  void api.apps.app.get.prefetch({ appId: id });
  void api.apps.app.githubLink.get.prefetch(id);
  void api.apps.app.transactions.count.prefetch({ appId: id });
  void api.apps.app.getNumTokens.prefetch({ appId: id });
  void api.apps.app.isOwner.prefetch(id);
  void api.user.apiKeys.count.prefetch({ appId: id });
  void api.apps.app.stats.overall.prefetch({ appId: id });

  return (
    <HydrateClient>
      <ReferralHandler appId={id} />
      <Body className="gap-0 pt-0">
        <Suspense fallback={<LoadingHeaderCard />}>
          <HeaderCard appId={id} />
        </Suspense>
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Setup appId={id} />
          </Suspense>
        </ErrorBoundary>
        <div className="flex flex-col gap-8">
          <Overview appId={id} />
        </div>
      </Body>
    </HydrateClient>
  );
}
