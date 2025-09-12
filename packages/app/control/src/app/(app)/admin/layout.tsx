import { userOrRedirectLayout } from '@/auth/user-or-redirect';
import { api } from '@/trpc/server';
import { forbidden } from 'next/navigation';

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  await userOrRedirectLayout('/admin');

  const isAdmin = await api.admin.isAdmin();

  if (!isAdmin) {
    return forbidden();
  }

  return children;
}
