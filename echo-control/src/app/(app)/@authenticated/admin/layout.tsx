import { api } from '@/trpc/server';
import { unauthorized } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const isAdmin = await api.admin.isAdmin();

    if (!isAdmin) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return children;
}
