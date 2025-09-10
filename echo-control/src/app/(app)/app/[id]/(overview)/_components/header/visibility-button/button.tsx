'use client';

import { Globe, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { api } from '@/trpc/client';
import { toast } from 'sonner';

interface Props {
  appId: string;
}

export const VisibilityButton: React.FC<Props> = ({ appId }) => {
  const [isOwner] = api.apps.app.isOwner.useSuspenseQuery(appId);
  const [app] = api.apps.app.get.useSuspenseQuery({ appId });

  const utils = api.useUtils();

  const { mutate: updateApp, isPending } = api.apps.app.update.useMutation({
    onSuccess: () => {
      utils.apps.app.get.setData({ appId }, prev => {
        if (!prev) return prev;
        return {
          ...prev,
          isPublic: !prev.isPublic,
        };
      });
      void utils.apps.app.isOwner.invalidate(appId);
      toast.success('App visibility updated');
    },
  });

  if (!isOwner) {
    return null;
  }

  return (
    <Button
      onClick={() => updateApp({ appId, isPublic: !app.isPublic })}
      disabled={isPending}
      variant="outline"
    >
      {app.isPublic ? (
        <Globe className="size-4" />
      ) : (
        <Lock className="size-4" />
      )}
      {app.isPublic ? 'Public' : 'Private'}
    </Button>
  );
};
