import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { api } from '@/trpc/server';
import { UsersIcon } from 'lucide-react';

interface Props {
  appId: string;
}

export const Users: React.FC<Props> = ({ appId }) => {
  return (
    <UsersContainer>
      <Suspense fallback={<UsersCountSkeleton />}>
        <UsersCount appId={appId} />
      </Suspense>
    </UsersContainer>
  );
};

const UsersCount = async ({ appId }: Props) => {
  const users = await api.apps.app.users.count({ appId });
  return <span className="text-sm">{users}</span>;
};

const UsersCountSkeleton = () => {
  return <Skeleton className="h-4 w-6" />;
};

const UsersContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-1 text-primary font-semibold">
      <UsersIcon className="size-3" />
      {children}
    </div>
  );
};

export const LoadingUsers = () => {
  return (
    <UsersContainer>
      <UsersCountSkeleton />
    </UsersContainer>
  );
};
