import { userOrRedirect } from '@/auth/user-or-redirect';
import { TabbedAdminDashboard } from '@/app/(app)/admin/_components/TabbedAdminDashboard';

export default async function AdminDashboardPage(props: PageProps<'/admin'>) {
  await userOrRedirect('/admin', props);

  return (
    <div className="container mx-auto py-8">
      <TabbedAdminDashboard />
    </div>
  );
}
