import { Body, Heading } from '../../_components/layout/page-utils';

import { LoadingAppsSection } from './_components/apps';
import { LoadingActivity } from './_components/activity';
import { LoadingPopularApps } from './_components/popular';
import { LoadingFeed } from './_components/feed';

import { auth } from '@/auth';

export default async function LoadingDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div>
      <Heading
        title={`Welcome Back${session?.user.name ? `, ${session.user.name.split(' ')[0]}!` : '!'}`}
        description="Build AI apps and earn profit on every token your users generate"
      />
      <Body>
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 max-w-full w-full">
          <div className="flex flex-col gap-4 w-full md:w-80 lg:w-96 max-w-full overflow-hidden shrink-0 pt-2">
            <LoadingAppsSection />
            <LoadingFeed />
          </div>
          <div className="flex flex-col gap-4 flex-1 overflow-hidden py-2">
            <LoadingActivity />
            <LoadingPopularApps />
          </div>
        </div>
      </Body>
    </div>
  );
}
