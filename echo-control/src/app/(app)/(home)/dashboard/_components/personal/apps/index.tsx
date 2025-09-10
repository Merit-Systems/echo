import React, { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Card } from '@/components/ui/card';

import { AppRows, LoadingAppRows } from './rows';
import type { RouterOutputs } from '@/trpc/client';
import { SubSection } from '../../utils';
import { NewAppButton } from './new-app';

interface Props {
  userApps: Promise<RouterOutputs['apps']['list']['owner']>;
}

export const Apps: React.FC<Props> = ({ userApps }) => {
  return (
    <AppsContainer>
      <ErrorBoundary fallback={<p>There was an error loading your apps</p>}>
        <div className="flex flex-col">
          <Suspense fallback={<LoadingAppRows />}>
            <AppRows appsPromise={userApps} />
          </Suspense>
        </div>
      </ErrorBoundary>
    </AppsContainer>
  );
};

export const LoadingAppsSection = () => {
  return (
    <AppsContainer>
      <LoadingAppRows />
    </AppsContainer>
  );
};

const AppsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <SubSection title="Apps" href="/my-apps" actions={<NewAppButton />}>
      <Card className="overflow-hidden relative">{children}</Card>
    </SubSection>
  );
};
