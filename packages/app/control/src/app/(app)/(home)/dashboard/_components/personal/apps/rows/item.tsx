import { UserAvatar } from '@/components/utils/user-avatar';

import { Code } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RouterOutputs } from '@/trpc/client';
import { Earnings, LoadingEarningsAmount } from './earnings';
import Link from 'next/link';
import { LoadingUsers, Users } from './users';

interface Props {
  app: RouterOutputs['apps']['list']['owner']['items'][number];
}

export const AppRow: React.FC<Props> = ({ app }) => {
  return (
    <Link
      href={`/app/${app.id}`}
      className="border-b last:border-b-0 hover:bg-muted/40 transition-colors"
    >
      <div className="p-2 flex justify-between items-center ">
        <div className="flex items-center gap-2">
          <UserAvatar
            src={app.profilePictureUrl}
            fallback={<Code className="size-4" />}
            className="size-8"
          />
          <div>
            <p className="font-bold text-foreground leading-tight">
              {app.name}
            </p>
            <Users appId={app.id} />
          </div>
        </div>
        <Earnings appId={app.id} />
      </div>
    </Link>
  );
};

export const LoadingAppRow = () => {
  return (
    <div className="border-b last:border-b-0 p-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Skeleton className="size-6" />
        <div>
          <Skeleton className="w-32 h-4 my-0.5" />
          <LoadingUsers />
        </div>
      </div>
      <LoadingEarningsAmount />
    </div>
  );
};
