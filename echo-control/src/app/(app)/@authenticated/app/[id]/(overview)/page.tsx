import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { notFound } from 'next/navigation';

import { Body } from '../../../_components/layout/page-utils';

import { api, HydrateClient } from '@/trpc/server';

import { HeaderCard, LoadingHeaderCard } from './_components/header';
import { Setup } from './_components/setup';
import { Overview } from './_components/overview';

export default async function AppPage({ params }: PageProps<'/app/[id]'>) {
  const { id } = await params;

  const app = await api.apps.app.get({ appId: id });
  api.apps.app.get.prefetch({ appId: id });
  api.apps.app.githubLink.get.prefetch(id);
  api.apps.app.transactions.count.prefetch({ appId: id });
  api.apps.app.getNumTokens.prefetch({ appId: id });
  api.apps.app.isOwner.prefetch(id);

  if (!app) {
    return notFound();
  }

  return (
    <HydrateClient>
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
          <Overview appId={id} createdAt={app.createdAt} />
        </div>
      </Body>
    </HydrateClient>
  );
}
