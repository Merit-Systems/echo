import AppUsersTable from '@/app/(app)/admin/_components/table/AppUsers';
import { TableLayout } from '@/app/(app)/admin/_components';
import { AppHeader } from '@/app/(app)/admin/_components/header/App';

interface AppUsersPageProps {
  params: Promise<{
    appId: string;
  }>;
}

export default async function AppUsersPage({ params }: AppUsersPageProps) {
  const { appId } = await params;

  return (
    <TableLayout
      title="App Users"
      description="Users and usage for the selected app"
    >
      <AppHeader appId={appId} />
      <AppUsersTable appId={appId} />
    </TableLayout>
  );
}
