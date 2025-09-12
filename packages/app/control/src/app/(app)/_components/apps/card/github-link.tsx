import { Suspense } from 'react';

import { SiGithub } from '@icons-pack/react-simple-icons';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { api } from '@/trpc/server';

interface Props {
  appId: string;
}

export const GithubLink: React.FC<Props> = ({ appId }) => {
  return (
    <GithubLinkContainer>
      <Suspense fallback={<UrlSkeleton />}>
        <Url appId={appId} />
      </Suspense>
    </GithubLinkContainer>
  );
};

const Url = async ({ appId }: Props) => {
  const githubUrl = await api.apps.app.githubLink.get(appId);
  return (
    <span className="max-w-full text-ellipsis whitespace-nowrap">
      {githubUrl
        ? githubUrl.githubUrl.split('/').slice(3).join('/')
        : 'Not connected'}
    </span>
  );
};

const UrlSkeleton = () => {
  return <Skeleton className="h-4 w-12" />;
};

const GithubLinkContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Badge variant="muted" className="rounded-full gap-2 w-fit px-1">
      <SiGithub className="size-3" />
      {children}
    </Badge>
  );
};

export const LoadingGithubLink = () => {
  return (
    <GithubLinkContainer>
      <UrlSkeleton />
    </GithubLinkContainer>
  );
};
