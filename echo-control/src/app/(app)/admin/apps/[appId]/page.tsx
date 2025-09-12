import { userOrRedirect } from '@/auth/user-or-redirect';
import { AppBreakdownDashboard } from '@/app/(app)/admin/_components/AppBreakdownDashboard';

interface AppBreakdownPageProps {
  params: Promise<{
    appId: string;
  }>;
}

export default async function AppBreakdownPage({ params }: AppBreakdownPageProps) {
  const { appId } = await params;
  await userOrRedirect('/admin', { params: Promise.resolve({}), searchParams: Promise.resolve({}) } as any);

  return (
    <div className="container mx-auto py-8">
      <AppBreakdownDashboard appId={appId} />
    </div>
  );
}