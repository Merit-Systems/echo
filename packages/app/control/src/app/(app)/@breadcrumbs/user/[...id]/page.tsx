import { Suspense } from 'react';

import { User } from 'lucide-react';

import { ErrorBoundary } from 'react-error-boundary';

import { Separator } from '../../_components/separator';
import { Breadcrumb, LoadingBreadcrumb } from '../../_components/breadcrumb';

import { api } from '@/trpc/server';

export default async function UserBreadcrumbs({
  params,
}: PageProps<'/user/[id]'>) {
  const { id } = await params;

  return (
    <ErrorBoundary fallback={null}>
      <Separator />
      <Suspense fallback={<LoadingBreadcrumb />}>
        <UserBreadcrumb userId={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

const UserBreadcrumb = async ({ userId }: { userId: string }) => {
  const user = await api.user.public.get(userId);
  return (
    <Breadcrumb
      href={`/user/${userId}`}
      image={user.image ?? null}
      name={user.name ?? 'Unknown'}
      Fallback={User}
    />
  );
};
