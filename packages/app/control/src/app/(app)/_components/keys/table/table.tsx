'use client';

import { Loader2, Trash2 } from 'lucide-react';

import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { KeyStatus, LoadingKeyStatus } from './status';

import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/utils/user-avatar';
import { api } from '@/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';

interface Key {
  id: string;
  name: string | null;
  createdAt: Date;
  lastUsed: Date | null;
  isArchived: boolean;
  echoApp: {
    id: string;
    name: string;
    profilePictureUrl: string | null;
  };
}

interface Pagination {
  hasNext: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

interface Props {
  keys: Key[];
  pagination: Pagination;
}

export const KeysTable: React.FC<Props> = ({ keys, pagination }) => {
  return (
    <BaseKeysTable pagination={pagination}>
      {keys.length > 0 ? (
        <KeyRows keys={keys} />
      ) : (
        <TableEmpty colSpan={6}>No keys found</TableEmpty>
      )}
    </BaseKeysTable>
  );
};

export const LoadingKeysTable = () => {
  return (
    <BaseKeysTable>
      <LoadingKeyRow />
      <LoadingKeyRow />
    </BaseKeysTable>
  );
};

const KeyRows = ({ keys }: { keys: Key[] }) => {
  return keys.map(key => <KeyRow key={key.id} apiKey={key} />);
};

const KeyRow = ({ apiKey }: { apiKey: Key }) => {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const deleteApiKey = api.user.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast.success('API key revoked successfully');
      void utils.user.apiKeys.list.invalidate();
    },
    onError: error => {
      toast.error(error.message || 'Failed to revoke API key');
    },
  });

  const handleRevoke = () => {
    deleteApiKey.mutate(apiKey.id);
    setIsOpen(false);
  };

  return (
    <TableRow key={apiKey.id}>
      <TableCell className="pl-4 font-bold">{apiKey.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <UserAvatar
            src={apiKey.echoApp.profilePictureUrl}
            className="size-4"
          />
          <p>{apiKey.echoApp.name}</p>
        </div>
      </TableCell>
      <TableCell>
        {apiKey.lastUsed ? format(apiKey.lastUsed, 'MMM d, yyyy') : 'Never'}
      </TableCell>
      <TableCell>{format(apiKey.createdAt, 'MMM d, yyyy')}</TableCell>
      <TableCell>
        <KeyStatus isArchived={apiKey.isArchived} />
      </TableCell>
      <TableCell>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              disabled={apiKey.isArchived}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Revoke API key</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke this API key? This action cannot
                be undone. Any applications using this key will no longer be
                able to authenticate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                disabled={deleteApiKey.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteApiKey.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  'Revoke'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

const LoadingKeyRow = () => {
  return (
    <TableRow>
      <TableCell className="pl-4 font-bold">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <LoadingKeyStatus />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  );
};

interface BaseKeysTableProps {
  children: React.ReactNode;
  pagination?: Pagination;
}

const BaseKeysTable = ({ children, pagination }: BaseKeysTableProps) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Name</TableHead>
            <TableHead>App</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[30px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
      {pagination?.hasNext && (
        <div className="flex justify-center">
          <Button
            onClick={pagination.fetchNextPage}
            className="w-full"
            variant="ghost"
            disabled={pagination.isFetchingNextPage}
            size="sm"
          >
            {pagination.isFetchingNextPage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </>
  );
};
