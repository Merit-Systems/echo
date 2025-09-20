'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { api } from '@/trpc/client';
import { Check, Loader2 } from 'lucide-react';

interface Props {
  appId: string;
  redirectUri: string;
  authorizedCallbackUrls: string[];
}

export const AddRedirectButton = ({
  appId,
  redirectUri,
  authorizedCallbackUrls,
}: Props) => {
  const router = useRouter();

  const {
    mutate: updateApp,
    isPending,
    isSuccess,
  } = api.apps.app.update.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const onAddRedirect = () => {
    updateApp({
      appId,
      authorizedCallbackUrls: [...authorizedCallbackUrls, redirectUri],
    });
  };

  return (
    <Button
      onClick={onAddRedirect}
      disabled={isPending || isSuccess}
      className="flex-1"
      variant="turbo"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isSuccess ? (
        <Check className="size-4" />
      ) : (
        'Authorize this URL'
      )}
    </Button>
  );
};
