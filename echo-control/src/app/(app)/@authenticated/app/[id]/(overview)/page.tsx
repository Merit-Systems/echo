import { notFound } from 'next/navigation';

import { Body, Heading } from '../../../_components/layout/page-utils';

import { api, HydrateClient } from '@/trpc/server';
import { UserAvatar } from '@/components/utils/user-avatar';
import { Code } from 'lucide-react';
import { Setup } from './_components/setup';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Overview } from './_components/overview';
import { VisibilityButton } from './_components/visibility-button';

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
      <Heading
        title={app.name}
        description={app.description ?? undefined}
        icon={
          <UserAvatar
            src={app.profilePictureUrl ?? undefined}
            className="size-12 shrink-0"
            fallback={<Code className="size-8" />}
          />
        }
        actions={<VisibilityButton appId={id} />}
      />
      <Body className="gap-0">
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Setup appId={id} />
          </Suspense>
        </ErrorBoundary>
        <Overview appId={id} createdAt={app.createdAt} />
      </Body>
    </HydrateClient>
  );
}
