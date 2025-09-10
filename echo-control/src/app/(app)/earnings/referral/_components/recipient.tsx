'use client';

import { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MinimalGithubAvatar } from '@/components/ui/github-avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

export const UserPayoutRecipient = () => {
  const [recipient] = api.user.githubLink.get.useSuspenseQuery();

  const [username, setUsername] = useState<string>('');

  const utils = api.useUtils();
  const { mutate: setRecipient, isPending: setRecipientPending } =
    api.user.githubLink.update.useMutation({
      onSuccess: () => {
        toast.success('Recipient GitHub updated');
        void utils.user.githubLink.get.invalidate();
      },
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Payout Recipient</CardTitle>
          <div className="mb-3 flex items-center justify-center">
            <MinimalGithubAvatar
              login={
                recipient?.githubUrl
                  ? (recipient.githubUrl
                      .replace(/^https?:\/\/github\.com\//, '')
                      .split('/')[0] ?? undefined)
                  : undefined
              }
              className="size-6"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              placeholder="github username (e.g. richardhendricks)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full sm:w-80"
            />
            <Button
              disabled={!username || setRecipientPending}
              onClick={() =>
                setRecipient({
                  type: 'user',
                  url: `https://github.com/${username}`,
                })
              }
            >
              {setRecipientPending ? 'Saving…' : 'Save Recipient'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
