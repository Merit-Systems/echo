import Link from 'next/link';

import { Button as ButtonComponent } from '@/components/ui/button';

import { api } from '@/trpc/server';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';

export const NewAppButton = () => {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <Button />
      </Suspense>
    </ErrorBoundary>
  );
};

const Button = async () => {
  const numApps = await api.apps.count.owner();

  if (numApps === 0) {
    return null;
  }

  return (
    <Link href="/new">
      <ButtonComponent variant="primaryGhost" size="xs">
        Create
        <Plus className="size-3" />
      </ButtonComponent>
    </Link>
  );
};
