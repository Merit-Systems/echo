'use client';

import { Suspense } from 'react';

import { Code, Loader2, X } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';

interface Props {
  selectedAppId: string;
  setSelectedAppId: (appId: string | undefined) => void;
  role: 'member' | 'owner';
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  clearable?: boolean;
}

export const AppSelect: React.FC<Props> = ({
  selectedAppId,
  setSelectedAppId,
  role,
  disabled,
  className,
  placeholder,
  clearable,
}) => {
  const [apps, { fetchNextPage, hasNextPage, isFetchingNextPage }] =
    api.apps.list[role].useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: lastPage => lastPage.page + 1,
      }
    );

  return (
    <div className="flex">
      <Select
        value={selectedAppId}
        onValueChange={setSelectedAppId}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <SelectContent
            onScroll={e => {
              const target = e.currentTarget;
              if (
                target.scrollTop + target.clientHeight >=
                  target.scrollHeight - 10 &&
                hasNextPage
              ) {
                fetchNextPage();
              }
            }}
          >
            {apps.pages
              .flatMap(page => page.items)
              .map(app => (
                <SelectItem key={app.id} value={app.id}>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={app.profilePictureUrl}
                      fallback={<Code className="size-4" />}
                      className="bg-transparent border-none size-6"
                    />
                    {app.name}
                  </div>
                </SelectItem>
              ))}
            {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
          </SelectContent>
        </Suspense>
      </Select>
      {clearable && selectedAppId && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedAppId(undefined)}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
};
