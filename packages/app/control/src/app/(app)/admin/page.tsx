import { userOrRedirect } from '@/auth/user-or-redirect';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminDashboardPage(props: PageProps<'/admin'>) {
  await userOrRedirect('/admin', props);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, search apps, and mint credits
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
