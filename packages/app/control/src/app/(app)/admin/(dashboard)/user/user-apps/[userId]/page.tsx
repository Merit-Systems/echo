import UserAppsTable from '@/app/(app)/admin/_components/table/UserApps';
import {
  UserAppsOverview,
  TableLayout,
  UserHeader,
  UserAppsChart,
} from '@/app/(app)/admin/_components';

interface UserAppsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserAppsPage({ params }: UserAppsPageProps) {
  const { userId } = await params;

  return (
    <TableLayout
      title="User's Apps"
      description="Apps and usage context for the selected user"
    >
      <UserHeader userId={userId} />
      <UserAppsOverview userId={userId} />
      <UserAppsChart userId={userId} />
      <UserAppsTable userId={userId} />
    </TableLayout>
  );
}
