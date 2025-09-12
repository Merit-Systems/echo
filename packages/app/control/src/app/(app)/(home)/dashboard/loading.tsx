import { Body, Heading } from '../../_components/layout/page-utils';

import { LoadingPersonalSection } from './_components/personal';
import { LoadingGlobalSection } from './_components/global';

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
        <LoadingPersonalSection />
        <LoadingGlobalSection />
      </Body>
    </div>
  );
}
