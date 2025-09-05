import Link from 'next/link';

import { Code } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { GithubLink, LoadingGithubLink } from './github-link';
import { Users, LoadingUsers } from './users';
import { Earnings, LoadingEarningsAmount } from './earnings';

import { cn } from '@/lib/utils';

interface Props {
  id: string;
  name: string;
  description: string | null;
  profilePictureUrl: string | null;
  homepageUrl: string | null;
}

export const AppCard = ({
  id,
  name,
  description,
  profilePictureUrl,
  homepageUrl,
}: Props) => {
  return (
    <Link href={`/app/${id}`}>
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardHeader className="flex flex-row items-start gap-2 w-full overflow-hidden pb-2 space-y-0 justify-between">
          <div className="flex flex-row items-center gap-2 flex-1 overflow-hidden">
            <UserAvatar
              className="size-10 shrink-0"
              src={profilePictureUrl ?? undefined}
              fallback={<Code className="size-4" />}
            />
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-ellipsis whitespace-nowrap overflow-x-hidden pb-1">
                {name}
              </CardTitle>
              <CardDescription
                className={cn(
                  'text-xs text-muted-foreground/60',
                  homepageUrl ? 'text-foreground/80' : 'text-foreground/40'
                )}
              >
                {homepageUrl ?? 'No homepage URL'}
              </CardDescription>
            </div>
          </div>
          <div className="shrink-0">
            <Earnings appId={id} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p
            className={cn(
              'text-sm text-muted-foreground/60',
              !description && 'text-muted-foreground/40'
            )}
          >
            {description ?? 'No description'}
          </p>
          <div className="flex items-center gap-2 justify-between">
            <Users appId={id} />
            <GithubLink appId={id} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const LoadingAppCard = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-2 w-full overflow-hidden pb-2 space-y-0 justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar
            className="size-10 shrink-0"
            src={null}
            fallback={<Code className="size-4" />}
          />
          <div className="flex flex-col gap-1">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-3 my-0.5" />
          </div>
        </div>
        <div className="shrink-0">
          <LoadingEarningsAmount />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="w-full h-4" />
        <div className="flex flex-row justify-between w-full">
          <LoadingUsers />
          <LoadingGithubLink />
        </div>
      </CardContent>
    </Card>
  );
};
