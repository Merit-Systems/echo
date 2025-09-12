import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { LoadingKeysTable } from '@/app/(app)/_components/keys/table/table';
import { KeysCard } from '@/app/(app)/_components/keys/table/card';

import { KeysTable } from './table';

const KeysWrapper = ({ children }: { children: React.ReactNode }) => {
  return <KeysCard title="Your Keys">{children}</KeysCard>;
};

export const Keys = () => {
  return (
    <KeysWrapper>
      <ErrorBoundary fallback={<div>Error loading keys</div>}>
        <Suspense fallback={<LoadingKeysTable />}>
          <KeysTable />
        </Suspense>
      </ErrorBoundary>
    </KeysWrapper>
  );
};

export const LoadingKeys = () => {
  return (
    <KeysWrapper>
      <LoadingKeysTable />
    </KeysWrapper>
  );
};
