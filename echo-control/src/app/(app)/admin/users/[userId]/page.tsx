import { userOrRedirect } from '@/auth/user-or-redirect';
import { UserBreakdownDashboard } from '@/app/(app)/admin/_components/UserBreakdownDashboard';

interface UserBreakdownPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserBreakdownPage({ params }: UserBreakdownPageProps) {
  const { userId } = await params;
  await userOrRedirect('/admin', { params: Promise.resolve({}), searchParams: Promise.resolve({}) } as any);

  return (
    <div className="container mx-auto py-8">
      <UserBreakdownDashboard userId={userId} />
    </div>
  );
}