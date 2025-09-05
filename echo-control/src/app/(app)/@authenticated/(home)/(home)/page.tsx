import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Body, Heading } from '../../_components/layout/page-utils';

import { NewAppButton } from './_components/new-app';
import { Apps } from './_components/apps';
import { Activity } from './_components/activity';
import { PopularApps } from './_components/popular';
import { Feed } from './_components/feed';

import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div>
      <Heading
        title={`Welcome Back${session?.user.name ? `, ${session.user.name.split(' ')[0]}!` : '!'}`}
        description="Build AI apps and earn profit on every token your users generate"
        actions={
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <NewAppButton />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Body>
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 max-w-full w-full">
          <div className="flex flex-col gap-4 w-full md:w-80 lg:w-96 max-w-full overflow-hidden shrink-0 pt-2">
            <Apps />
            <Feed />
          </div>
          <div className="flex flex-col gap-4 flex-1 overflow-hidden py-2">
            <Activity />
            <PopularApps />
          </div>
        </div>
      </Body>
    </div>
  );
}
