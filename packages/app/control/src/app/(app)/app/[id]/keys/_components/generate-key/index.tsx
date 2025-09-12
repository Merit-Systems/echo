import { Suspense } from 'react';

import { Code } from 'lucide-react';

import { ErrorBoundary } from 'react-error-boundary';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserAvatar } from '@/components/utils/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { GenerateKeyForm } from './form';

import { api } from '@/trpc/server';

interface Props {
  appId: string;
  generate: boolean;
}

export const GenerateKey: React.FC<Props> = ({ appId, generate }) => {
  const app = api.apps.app.get({ appId });

  return (
    <Dialog defaultOpen={!!generate}>
      <DialogTrigger asChild>
        <Button variant="turbo">Generate Key</Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold leading-none">
            Generate API Key
          </DialogTitle>
          <DialogDescription>
            This key can only be used in{' '}
            <Suspense fallback={null}>
              <span className="font-bold">
                <AppName namePromise={app.then(app => app.name)} />
              </span>
            </Suspense>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 p-4 bg-muted mx-4 rounded-lg">
          <Suspense fallback={<Skeleton className="size-8" />}>
            <Avatar
              profilePictureUrlPromise={app.then(app => app.profilePictureUrl)}
            />
          </Suspense>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold leading-none">
              <Suspense fallback={<Skeleton className="h-4 w-24" />}>
                <AppName namePromise={app.then(app => app.name)} />
              </Suspense>
            </h2>
            <ErrorBoundary
              fallback={
                <p className="text-xs text-muted-foreground">
                  Error loading owner
                </p>
              }
            >
              <Suspense fallback={<Skeleton className="h-4 w-24" />}>
                <p className="text-xs text-muted-foreground">
                  <Owner appId={appId} />
                </p>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        <div className="w-full max-w-full overflow-hidden p-4 pt-0">
          <GenerateKeyForm appId={appId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Owner = async ({ appId }: { appId: string }) => {
  const owner = await api.apps.app
    .getOwner(appId)
    .then(owner => owner.name)
    .catch(() => 'Owner not found');

  return owner;
};

const AppName = async ({ namePromise }: { namePromise: Promise<string> }) => {
  return await namePromise;
};

const Avatar = async ({
  profilePictureUrlPromise,
}: {
  profilePictureUrlPromise: Promise<string | null>;
}) => {
  const profilePictureUrl = await profilePictureUrlPromise;

  return (
    <UserAvatar
      src={profilePictureUrl ?? undefined}
      fallback={<Code className="size-6" />}
      className="size-8"
    />
  );
};
