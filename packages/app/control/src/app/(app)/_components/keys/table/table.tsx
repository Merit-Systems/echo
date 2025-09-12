'use client';

import { Loader2 } from 'lucide-react';

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

import { KeyStatus, LoadingKeyStatus } from './status';

import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/utils/user-avatar';

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
        <TableEmpty colSpan={4}>No keys found</TableEmpty>
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
