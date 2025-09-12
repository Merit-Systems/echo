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
      <Suspense fallback={<UsersSkeleton />}>
        <UsersCount appId={appId} />
      </Suspense>
    </UsersContainer>
  );
};

export const LoadingUsers = () => {
  return (
    <UsersContainer>
      <UsersSkeleton />
    </UsersContainer>
  );
};

const UsersCount = async ({ appId }: Props) => {
  const users = await api.apps.app.users.count({ appId });
  return (
    <span className="text-xs">
      {users} user{users === 1 ? '' : 's'}
    </span>
  );
};

const UsersSkeleton = () => {
  return <Skeleton className="h-3 w-10 my-[2px]" />;
};

const UsersContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-1 font-medium text-muted-foreground/60">
      <UsersIcon className="size-3" />
      {children}
    </div>
  );
};
